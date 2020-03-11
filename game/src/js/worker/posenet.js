import * as posenet from '@tensorflow-models/posenet';
import 'regenerator-runtime/runtime';
import CONFIG from '../helper/config';

let net = null;
let canvas = null;
let ctx = null;
let detecting = false;

async function init() {
    console.log('POSENET: Initialising...');
    net = await posenet.load({
        architecture: CONFIG.posenetArchitecture,
        outputStride: CONFIG.outputStride,
        quantBytes: CONFIG.quantBytes,
        multiplier: CONFIG.posenetMult
    });
    canvas = new OffscreenCanvas(0,0);
    ctx = canvas.getContext('2d');
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
    // let currentX = 0;
    // let left = pose.keypoints[5].position.x;
    // let right = pose.keypoints[6].position.x;
    // currentX = (left + right) / 2;

    return pose.keypoints[0].position.x;
    // return currentX;
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
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.clearRect(0,0,bitmap.width,bitmap.height);
    ctx.drawImage(bitmap,0,0,bitmap.width,bitmap.height);
    let r = {
        data: ctx.getImageData(0,0,bitmap.width, bitmap.height),
        width: bitmap.width
    };
    return r;
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
            flipHorizontal: true,
            decodingMethod: 'multi-person',
            maxDetections: CONFIG.maxPlayers
        });
        let orderedPoses = orderPoses(poses);
        let posesMidPoint = getGroupMidPoint(poses);
        let relativePoint = pointRelativeToScreen(posesMidPoint, videoData.width);
        detecting = false;
        console.log('Poses: ', poses);
        
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
            getPoses(convertImageBitmapToData(data.video)).then(r => {
                postMessage({
                    poses: r
                });
            }).catch(e => console.warn(e));
        default:
            break;
    }
};

export {
    init,
    getPoses,
    getGroupMidPoint
}