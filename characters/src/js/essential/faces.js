import * as faceapi from 'face-api.js';

let videoEl = null;
let faces = [];

function getFaces() {
    return faces;
}

async function render() {
    let detections = await faceapi.detectAllFaces(videoEl);
    detections = faceapi.resizeResults(detections, {width: videoEl.width, height: videoEl.height});
    if (detections) {
        detections.forEach(async (f, i) => {
            faces[i] = await faceapi.extractFaces(videoEl, [f]);
        });
    }
    requestAnimationFrame(render);
}

async function init() {
    const MODEL_URL = '/facemodels';

    await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    await faceapi.loadFaceLandmarkModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    await faceapi.loadAgeGenderModel(MODEL_URL);

    videoEl = document.querySelector('#user-video');


    videoEl.addEventListener('loadeddata', render, false);
}

export {
    init,
    getFaces
};