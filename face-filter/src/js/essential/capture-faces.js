import * as faceapi from 'face-api.js';
import 'regenerator-runtime/runtime';

export default class FaceCapture {
    constructor(videoEl) {
        return new Promise((res,rej) => {
            this.videoEl = videoEl;
    
            this.MODEL_URL = '/facemodels';
    
            this.load(res);
        });
    }

    async load(res) {
        await faceapi.loadSsdMobilenetv1Model(this.MODEL_URL);
        await faceapi.loadFaceLandmarkModel(this.MODEL_URL);
        await faceapi.loadFaceRecognitionModel(this.MODEL_URL);
        await faceapi.loadAgeGenderModel(this.MODEL_URL);

        return this.detect(res);
    }

    async detect(res) {
        let detections = await faceapi.detectAllFaces(this.videoEl);
        detections = faceapi.resizeResults(detections, {width: this.videoEl.width, height: this.videoEl.height});
        this.detections = detections;
        res(this);
    }

    returnCanvases() {
        let canvases = [];
        this.detections.forEach(async d => {
            canvases.push(await faceapi.extractFaces(this.videoEl, d));
        });

        return canvases;
    }
}