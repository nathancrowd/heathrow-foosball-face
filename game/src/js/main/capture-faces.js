import * as faceapi from 'face-api.js';
import CONFIG from '../helper/config';
import 'regenerator-runtime/runtime';

export default class FaceCapture {
    constructor(videoEl, callback) {
        this.videoEl = videoEl;

        this.MODEL_URL = '/facemodels';
        this.res = callback;
        this.load();

        this.idle = true;
    }

    /**
     * Adds DOM circles as acceptable areas for face capture
     */
    addFaceFrames() {
        this.frames = [];
        for (let index = 0; index < CONFIG.faceSlots.length; index++) {
            let frame = document.createElement('div');
            frame.classList.add('face-frame');
            document.body.appendChild(frame);
            this.frames.push(frame);
        }
    }

    /**
     * removes acceptable face DOM circles
     */
    deleteFaceFrames() {
        this.frames.forEach(f => {
            f.parentElement.removeChild(f);
        });
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
            let inBottom = face.box.top + (face.box.height/2) > f.getBoundingClientRect().top && face.box.top + (face.box.height/2) < f.getBoundingClientRect().bottom;
            let inLeft = window.innerWidth - face.box.right > f.getBoundingClientRect().left && window.innerWidth - face.box.right < f.getBoundingClientRect().right;
            let inRight = window.innerWidth - face.box.left > f.getBoundingClientRect().left && window.innerWidth - face.box.left < f.getBoundingClientRect().right;

            if (inTop && inBottom && inLeft && inRight) {
                returnFrame = {frameEl: f, frameIndex: i};
            }
        });
        
        return returnFrame;
    }

    /**
     * Loads FaceApi and starts a loop listening for faces.
     */
    async load() {
        console.log('FaceCapture: Loading models...');
        await faceapi.loadSsdMobilenetv1Model(this.MODEL_URL);
        await faceapi.loadFaceLandmarkModel(this.MODEL_URL);
        await faceapi.loadFaceRecognitionModel(this.MODEL_URL);
        await faceapi.loadAgeGenderModel(this.MODEL_URL);
        this.detections = [];

        this.counter = document.querySelector('.counter');
        console.log('FaceCapture: Reading Faces...');
        this.startDetection();
    }

    startDetection() {
        this.loop = requestAnimationFrame(this.detect.bind(this));
    }

    endDetection() {
        console.log('Stopping Face Detection');
        cancelAnimationFrame(this.loop);
    }
    
    /**
     * Run a countdown timer for capturing faces
     */
    startTimer() {
        this.startTime = Date.now();
        setTimeout(() => {
            this.counter.innerHTML = 'Faces Captured';
            this.deleteFaceFrames();
            this.res(this);
        },CONFIG.faceCountdown);
    }

    /**
     * Detect faces and check if they are in a frame.
     * Any captured faces are added to a detections array as a HTMLCanvas.
     */
    async detect() {
        if (!this.idle) {
            this.counter.innerHTML = (CONFIG.faceCountdown / 1000) - Math.floor((Date.now() - this.startTime) / 1000);
        }
        this.loop = requestAnimationFrame(this.detect.bind(this));
        let detections = await faceapi.detectAllFaces(this.videoEl);
        detections = faceapi.resizeResults(detections, {width: this.videoEl.width, height: this.videoEl.height});
        if (!detections.length) {
            return;
        }
        if (this.idle) {
            idleScreen.style.display = 'none';
            this.addFaceFrames();
            this.startTimer();
            this.idle = false;
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