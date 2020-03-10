import * as posenet from '@tensorflow-models/posenet';
import CONFIG from '../helper/config';

let net = null;

async function init() {
    console.log('POSENET: Initialising...');
    net = await posenet.load({
        architecture: CONFIG.posenetArchitecture,
        outputStride: CONFIG.outputStride,
        quantBytes: CONFIG.quantBytes,
        multiplier: CONFIG.posenetMult
    });
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

function getPoses() {
    return new Promise(async (res, rej) => {
        if (!net) {
            rej('POSENET: Net is not initialised');
        }
        let poses = await net.estimateMultiplePoses(videoEl, {
            scoreThreshold: CONFIG.scoreThreshold,
            flipHorizontal: true,
            decodingMethod: 'multi-person',
            maxDetections: CONFIG.maxPlayers
        });
        res(orderPoses(poses));
    });
}


export {
    init,
    getPoses,
    getGroupMidPoint
}