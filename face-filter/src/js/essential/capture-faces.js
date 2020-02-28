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
        console.log('FaceCapture: Loading models...');
        await faceapi.loadSsdMobilenetv1Model(this.MODEL_URL);
        await faceapi.loadFaceLandmarkModel(this.MODEL_URL);
        await faceapi.loadFaceRecognitionModel(this.MODEL_URL);
        await faceapi.loadAgeGenderModel(this.MODEL_URL);

        return this.detect(res);
    }

    async detect(res) {
        console.log('FaceCapture: Reading Faces...');
        let detections = await faceapi.detectAllFaces(this.videoEl);
        detections = faceapi.resizeResults(detections, {width: this.videoEl.width, height: this.videoEl.height});
        this.detections = detections;
        console.log('FaceCapture: Faces Captured');
        res(this);
    }

    returnCanvases(cb) {
        let canvases = [];
        new Promise((res,rej) => {
            this.detections.forEach(async (d,i) => {
                let c = await faceapi.extractFaces(this.videoEl, [d]);
                canvases.push(c);
                if (i == this.detections.length - 1) {
                    res();
                }
            });
        }).then(() => {
            cb(canvases);
        });

    }
}