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
    canvas = new OffscreenCanvas(CONFIG.dimensions.width,CONFIG.dimensions.height);
    ctx = canvas.getContext('2d');
    console.log('POSENET: Initialised');
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
    // let currentX = (left + right) / 2;

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
    ctx.clearRect(0,0,CONFIG.dimensions.width,CONFIG.dimensions.height);
    ctx.drawImage(bitmap,0,0);
    let data = ctx.getImageData(0,0,bitmap.width, bitmap.height);
    return data;
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
        let poses = await net.estimateMultiplePoses(videoData, {
            scoreThreshold: CONFIG.scoreThreshold,
            flipHorizontal: true,
            decodingMethod: 'multi-person',
            maxDetections: CONFIG.maxPlayers
        });
        let orderedPoses = orderPoses(poses);
        detecting = false;
        res(orderedPoses);
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