import './utils/faceEnvWorkerPatch';
import * as faceapi from "face-api.js";
import "regenerator-runtime/runtime";

let canvas = null;
let ctx = null;

const MODEL_URL = '/facemodels';
canvas = new OffscreenCanvas(0, 0);
ctx = canvas.getContext('2d');
let loaded = false;


function load(callback) {
    console.log('EMOTIONS: Loading models...');
    faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    faceapi.loadFaceLandmarkModel(MODEL_URL);
    faceapi.loadAgeGenderModel(MODEL_URL);
    faceapi.loadFaceExpressionModel(MODEL_URL);
    loaded = true;
    console.log('EMOTIONS: Loaded models...');
}

function convertImageBitmapToData(bitmap) {
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.clearRect(0, 0, bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
    return canvas;
}

async function getEmotions(canvas) {

    let detections = await faceapi.detectAllFaces(canvas).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
    postMessage({
        emotions: detections
    });

}

async function getDemographics(canvas) {
    let detections = await faceapi.detectAllFaces(canvas).withFaceLandmarks().withAgeAndGender();
    postMessage({
        emotions: detections
    });
}

onmessage = e => {
    let data = e.data;
    switch (data.action) {
        case 'init':
            load();
            break;
        case 'getEmotions':
            getEmotions(convertImageBitmapToData(data.video));
            break;
        case 'getDemographics':
            getDemographics(convertImageBitmapToData(data.video));
            break;
        default:
            break;
    }
};
