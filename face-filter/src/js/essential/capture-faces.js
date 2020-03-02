import * as faceapi from 'face-api.js';
import * as config from './config';
import 'regenerator-runtime/runtime';

export default class FaceCapture {
    constructor(videoEl) {
        return new Promise((res,rej) => {
            this.videoEl = videoEl;
    
            this.MODEL_URL = '/facemodels';
    
            this.load(res);
        });
    }

    /**
     * Adds DOM circles as acceptable areas for face capture
     */
    addFaceFrames() {
        this.frames = [];
        for (let index = 0; index < config.maxFaces; index++) {
            let frame = document.createElement('div');
            frame.classList.add('face-frame');
            document.body.appendChild(frame);
            this.frames.push(frame);
        }
    }

    /**
     * @param {*} face a detection returned by FaceApi
     * Checks if a given face is within any of the face frames.
     * Returns `false` if it isn't. Returns an object with the frame element and it's index if it is.
     */
    isFaceInFrame(face) {
        let returnFrame = false;
        this.frames.forEach((f,i) => {
            let inTop = face.box.top > f.getBoundingClientRect().top && face.box.top < f.getBoundingClientRect().bottom;
            let inBottom = (face.box.top + face.box.height) > f.getBoundingClientRect().top && (face.box.top + face.box.height) < f.getBoundingClientRect().bottom;
            let inLeft = face.box.left > f.getBoundingClientRect().left && face.box.left < f.getBoundingClientRect().right;
            let inRight = face.box.right > f.getBoundingClientRect().left && face.box.right < f.getBoundingClientRect().right;

            if (inTop && inBottom && inLeft && inRight) {
                returnFrame = {frameEl: f, frameIndex: i};
            }
        });
        
        return returnFrame;
    }

    /**
     * Loads FaceApi and starts a loop listening for faces.
     * @param {*} res Callback function on completion.
     */
    async load(res) {
        console.log('FaceCapture: Loading models...');
        await faceapi.loadSsdMobilenetv1Model(this.MODEL_URL);
        await faceapi.loadFaceLandmarkModel(this.MODEL_URL);
        await faceapi.loadFaceRecognitionModel(this.MODEL_URL);
        await faceapi.loadAgeGenderModel(this.MODEL_URL);
        this.addFaceFrames();
        this.detections = [];

        this.counter = document.querySelector('.counter');
        this.startTime = Date.now();
        console.log('FaceCapture: Reading Faces...');
        this.loop = requestAnimationFrame(this.detect.bind(this));
        setTimeout(() => {
            cancelAnimationFrame(this.loop);
            this.counter.innerHTML = 'Faces Captured';
            res(this);
        },config.countdown);
    }

    /**
     * Detect faces and check if they are in a frame.
     * Any captured faces are added to a detections array as a HTMLCanvas.
     */
    async detect() {
        this.counter.innerHTML = (config.countdown / 1000) - Math.floor((Date.now() - this.startTime) / 1000);
        this.loop = requestAnimationFrame(this.detect.bind(this));
        let detections = await faceapi.detectAllFaces(this.videoEl);
        detections = faceapi.resizeResults(detections, {width: this.videoEl.width, height: this.videoEl.height});
        if (!detections) {
            return;
        }
        
        detections.forEach(d => {
            let faceFrame = this.isFaceInFrame(d);
            if (faceFrame) {
                if (faceFrame.frameEl.classList.contains('wait')) {
                    return;
                } else {
                    faceFrame.frameEl.classList.add('wait');
                    faceapi.extractFaces(this.videoEl, [d]).then((c) => {
                        faceFrame.frameEl.classList.add('active');
                        this.detections[faceFrame.frameIndex] = c;
                        console.log('FaceCapture: Face Captured');
                    });
                }
            }
        });
    }
}