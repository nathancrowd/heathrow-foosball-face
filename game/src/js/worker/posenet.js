import * as posenet from '@tensorflow-models/posenet';
import 'regenerator-runtime/runtime';
import CONFIG from '../helper/config';

let net = null;
let canvas = null;
let ctx = null;
let detecting = false;
let videoType = null;

let minPoseX = null;
let maxPoseX = 0;
let poseRange = 0;

async function init() {
    console.log('POSENET: Initialising...');
    net = await posenet.load({
        architecture: CONFIG.posenetArchitecture,
        outputStride: CONFIG.outputStride,
        quantBytes: CONFIG.quantBytes,
        multiplier: CONFIG.posenetMult
    });
    if (typeof(OffscreenCanvas) != 'undefined') {
        canvas = new OffscreenCanvas(0,0);
        ctx = canvas.getContext('2d');
    }
    console.log('POSENET: Initialised');
}

function pointRelativeToScreen(xPoint, width) {
    let relX = xPoint / width;

    let diff = relX - 0.5;
    
    return diff;
}

function getGroupMidPoint(poses) {
    let poseXs = [];
    poses.forEach(p => {
        poseXs.push(getPoseXPos(p));
    });

    let totalX = 0;
    poseXs.forEach(p => {
        totalX += p;
    });

    let midPoint = totalX / poses.length;

    return midPoint;
}

function getPoseXPos(pose) {
    return pose.keypoints[0].position.x;
}

function orderPoses(poses) {
    poses.sort((a,b) => {
        let aX = getPoseXPos(a);
        let bX = getPoseXPos(b);

        if (aX > bX) {
            return -1;
        } else if (bX > aX) {
            return 1;
        } else {
            return 0;
        }
    });
    return poses;
}

function convertImageBitmapToData(bitmap) {
    if (!canvas) {
        return;
    }
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.clearRect(0,0,bitmap.width,bitmap.height);
    ctx.drawImage(bitmap,0,0,bitmap.width,bitmap.height);
    let r = {
        data: canvas,
        width: bitmap.width
    };
    return r;
}

/**
 * getPosePositions
 * 
 * Calculate how each pose is leaning.
 * returns an array of their relative positions to centre.
 * 
 * @param {*} poses 
 */
function getPosePositions(poses) {
    let totalX = 0;
    let totalPoses = [];
    poses.forEach(p => {
        let nose = p.keypoints[0].position.x;
        let height = p.keypoints[0].position.y;
        if (height > (canvas.height * 0.5)) {
            return;
        }
        if (!minPoseX || nose < minPoseX) {
            minPoseX = nose;
        }
        if (nose > maxPoseX) {
            maxPoseX = nose;
        }
        totalPoses.push(nose);
        totalX += nose;
    });

    if (totalPoses.length == 0) {
        return canvas.width * 0.8;
    }
    return totalX / totalPoses.length;
}

function getPoses(videoData) {
    return new Promise(async (res, rej) => {
        if (!net) {
            rej('POSENET: Net is not initialised');
        }
        if (detecting) {
            rej('');
            return;
        }
        detecting = true;
        let poses = await net.estimateMultiplePoses(videoData.data, {
            scoreThreshold: CONFIG.scoreThreshold,
            flipHorizontal: videoType == 'webcam',
            decodingMethod: 'multi-person',
            maxDetections: CONFIG.maxPlayers[`${videoType}`]
        });
        let relativePoint = 0;
        if (videoType == 'webcam') {
            let orderedPoses = orderPoses(poses);
            let posesMidPoint = getGroupMidPoint(orderedPoses);
            relativePoint = pointRelativeToScreen(posesMidPoint, videoData.width);
        } else if (videoType == 'zoom') {
            let averagePosition = getPosePositions(poses); // Average x position of all poses within acceptable range
            if (poseRange < CONFIG.maxPoseRange) {
                poseRange = maxPoseX - minPoseX; // Acceptable range
            }
            let posInRange = (averagePosition - minPoseX) / poseRange; // position in range  0 - 1;
            relativePoint = (posInRange - 0.5); // convert to movement range (-0.5 - 0.5)
            if (relativePoint < -0.5) {
                relativePoint = -0.5;
            }
            if (relativePoint > 0.5) {
                relativePoint = 0.5;
            }
        }
        detecting = false;
        res(relativePoint);
    });
}

onmessage = e => {
    let data = e.data;
    
    switch (data.action) {
        case 'init':
            init();
            break;
        case 'getPoses':
            videoType = data.videoType;
            getPoses(convertImageBitmapToData(data.video)).then(r => {
                postMessage({
                    poses: r
                });
            }).catch(e => {});
        default:
            break;
    }
};

export {
    init,
    getPoses,
    getGroupMidPoint
}

function toTuple({y, x}) {
    return [y, x];
  }
  
  export function drawPoint(ctx, y, x, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  /**
   * Draws a line on a canvas, i.e. a joint
   */
  export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  
  /**
   * Draws a pose skeleton by looking up all adjacent keypoints/joints
   */
  export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
    const adjacentKeyPoints =
        posenet.getAdjacentKeyPoints(keypoints, minConfidence);
  
    adjacentKeyPoints.forEach((keypoints) => {
      drawSegment(
          toTuple(keypoints[0].position), toTuple(keypoints[1].position), color,
          scale, ctx);
    });
  }
  
  /**
   * Draw pose keypoints onto a canvas
   */
  export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    for (let i = 0; i < keypoints.length; i++) {
      const keypoint = keypoints[i];
  
      if (keypoint.score < minConfidence) {
        continue;
      }
  
      const {y, x} = keypoint.position;
      drawPoint(ctx, y * scale, x * scale, 3, color);
    }
  }