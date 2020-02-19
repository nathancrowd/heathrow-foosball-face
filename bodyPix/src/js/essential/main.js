import 'regenerator-runtime/runtime';
import * as bodyPix from '@tensorflow-models/body-pix';
import captureVideo from './video-capture';

const segmentationThreshold = 0.5;
const flip = true;
const outputStride = 16;
const maxPeople = 4;
const maskOpacity = 0.7;
const maskBlur = 0;

let net = null;
let videoEl = null;
let canvasEl = null;

async function renderLoop() {
    const personSegmentation = await net.segmentPersonParts(videoEl, {
        segmentationThreshold: segmentationThreshold,
        flipHorizontal: flip,
        maxDetections: maxPeople,
    });
    

    if (personSegmentation) {
        const coloredPart = bodyPix.toColoredPartMask(personSegmentation);
        bodyPix.drawMask(canvasEl, videoEl, coloredPart, maskOpacity, maskBlur, flip);
    }

    requestAnimationFrame(renderLoop);
}

export default async function loadBodyPix() {
    
    net = await bodyPix.load();


    videoEl = document.querySelector('#user-video');
    canvasEl = document.querySelector('#user-mask');

    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;

    videoEl.addEventListener('loadeddata', async () => {
        renderLoop();
    }, false);

    captureVideo();

}