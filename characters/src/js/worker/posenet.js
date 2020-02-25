import * as posenet from '@tensorflow-models/posenet';
import config from '../essential/config';
import 'regenerator-runtime/runtime';
let net = null;
let video = null;
let videoBufferCanvas = null;
let videoBufferContext = null;
let canvasSize = null;
let init = async (s) => {
    canvasSize = s;
    console.log('[POSENET]: Initialising...');
    videoBufferCanvas = new OffscreenCanvas(canvasSize.width, canvasSize.height);
    videoBufferContext = videoBufferCanvas.getContext("2d");
    net = await posenet.load({
        architecture: config.netArchitecture,
        outputStride: config.outputStride,
    });
    console.log('[POSENET]: Initialised');
}
let poses = async () => {
    if (!net) {
        console.warn('[POSENET]: Net is not initialised');
        return;
    }
    let poses = await net.estimateMultiplePoses(videoBufferCanvas, {
        scoreThreshold: 0.7,
        flipHorizontal: true,
        decodingMethod: 'multi-person',
        maxDetections: config.maxPlayers
    });

    self.postMessage({
        poses: poses
    });
}
let receiveVideo = (videoData) => {
    videoBufferContext.clearRect(0,0,canvasSize.width, canvasSize.height);
    videoBufferContext.drawImage(videoData, 0, 0);
}
self.addEventListener('message', async (message) => {
    switch (message.data.action) {
        case 'init':
            init(message.data.canvasSize);
            break;
        case 'get_poses':
            poses();
            break;
        case 'send_video':
            receiveVideo(message.data.video);
            break;
        default:
            break;
    }
});