import 'regenerator-runtime/runtime';
import * as posenet from '@tensorflow-models/posenet';
import captureVideo from './video-capture';

const segmentationThreshold = 0.5;
const flip = false;
const maxPeople = 4;
const color = 'aqua';
const lineWidth = 2;

let net = null;
let videoEl = null;
let canvasEl = null;
let ctx = null;

function toTuple({y, x}) {
    return [y, x];
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
    const adjacentKeyPoints =
        posenet.getAdjacentKeyPoints(keypoints, minConfidence);
  
    adjacentKeyPoints.forEach((keypoints) => {
      drawSegment(
          toTuple(keypoints[0].position), toTuple(keypoints[1].position), color,
          scale, ctx);
    });
}

async function renderLoop() {
    const poses = await net.estimateMultiplePoses(videoEl, {
        segmentationThreshold: segmentationThreshold,
        flipHorizontal: flip,
        decodingMethod: 'multi-person',
        maxDetections: maxPeople
    });
    
    if (poses) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-window.innerWidth, 0);
        ctx.drawImage(videoEl, 0, 0, window.innerWidth, window.innerHeight);
        ctx.restore();
        poses.forEach(({score, keypoints}) => {
            if (score >= 0.1) {
                drawSkeleton(keypoints, 0.1, ctx);
            }
        })
    }

    requestAnimationFrame(renderLoop);
}

export default async function loadPoseNet() {
    
    net = await posenet.load();


    videoEl = document.querySelector('#user-video');
    canvasEl = document.querySelector('#user-mask');
    ctx = canvasEl.getContext('2d');

    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;

    videoEl.addEventListener('loadeddata', async () => {
        renderLoop();
    }, false);

    captureVideo();

}