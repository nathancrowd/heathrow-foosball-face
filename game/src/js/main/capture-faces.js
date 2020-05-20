import * as faceapi from 'face-api.js';
import CONFIG from '../helper/config';
import 'regenerator-runtime/runtime';
import * as Sound from './sound';
import * as message from './message';
import getRandomInt from '../helper/randomInt';


export default class FaceCapture {
    constructor(videoEl) {
        this.videoEl = videoEl;

        this.MODEL_URL = '/facemodels';

        this.idle = true;
        this.end = false;
        this.count = 0;
    }

    /**
     * Adds DOM circles as acceptable areas for face capture
     */
    addFaceFrames() {
        this.frames = [];
        if (CONFIG.mobile) {
            let frame = document.createElement('div');
            frame.classList.add('face-frame');
            document.body.appendChild(frame);
            this.frames.push(frame);
        } else {
            for (let index = 0; index < CONFIG.faceSlots.length; index++) {
                let frame = document.createElement('div');
                frame.classList.add('face-frame');
                document.body.appendChild(frame);
                this.frames.push(frame);
            }
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
    async load(callback) {
        console.log('FaceCapture: Loading models...');
        await faceapi.loadSsdMobilenetv1Model(this.MODEL_URL);
        await faceapi.loadFaceLandmarkModel(this.MODEL_URL);
        await faceapi.loadFaceRecognitionModel(this.MODEL_URL);
        await faceapi.loadAgeGenderModel(this.MODEL_URL);
        this.detections = [];
        this.zoomFaces = [];
        console.log('FaceCapture: Reading Faces...');
        callback();
    }

    startDetection(callback) {
        this.res = callback;
        this.end = false;
        this.count = 0;
        console.log('FaceCapture: Starting Face Detection');
        this.loop = requestAnimationFrame(this.detect.bind(this));
    }

    endDetection() {
        console.log('FaceCapture: Stopping Face Detection');
        this.end = true;
        cancelAnimationFrame(this.loop);
    }
    
    /**
     * Run a countdown timer for capturing faces
     */
    startTimer() {        
        this.startTime = Date.now();
        setTimeout(() => {
            this.endDetection();
            this.res(this);
        },CONFIG.faceCountdown);
    }

    showDetection() {
        this.idle = false;
        videoEl.classList.remove('hide');
        idleScreen.style.display = 'none';
        message.popup();
        message.show();
        this.startTimer();
    }

    clear() {
        this.detections = [];
    }

    /**
     * Detect faces and check if they are in a frame.
     * Any captured faces are added to a detections array as a HTMLCanvas.
     */
    async detect() {
        if (this.end) {
            return;
        }
        if (!this.idle && CONFIG.videoType == 'webcam') {
            // calulate time
            message.add(`<h2>${this.count} player${this.count == 1 ? '' : 's'}<br><br>${(CONFIG.faceCountdown / 1000) - Math.floor((Date.now() - this.startTime) / 1000)}<small>s</small> until kickoff!</h2>`);
        } else if (!this.idle && CONFIG.videoType == 'zoom') {
            message.add(`<h2>${(CONFIG.faceCountdown / 1000) - Math.floor((Date.now() - this.startTime) / 1000)}<small>s</small> until kickoff!<br/><br/>Get your game faces ready!</h2>`);
        }
        this.loop = requestAnimationFrame(this.detect.bind(this));
        let detections = await faceapi.detectAllFaces(this.videoEl);
        // detections = faceapi.resizeResults(detections, {width: this.videoEl.width, height: this.videoEl.height});
        if (!detections.length || this.end) {
            return;
        }
        if (this.idle && !this.end) {
            this.showDetection();
        }
        detections.forEach((d,i) => {
            switch (CONFIG.videoType) {
                case 'webcam':
                    let faceFrame = this.isFaceInFrame(d);
                    if (faceFrame) {
                        if (faceFrame.frameEl.classList.contains('wait')) {
                            return;
                        } else {
                            faceFrame.frameEl.classList.add('wait');
                            faceapi.extractFaces(this.videoEl, [d]).then((c) => {
                                faceFrame.frameEl.classList.add('active');
                                this.detections[faceFrame.frameIndex] = c;
                                Sound.bell();
                                this.count++;
                            });
                        }
                    }
                    break;
                case 'zoom':
                    faceapi.extractFaces(this.videoEl, [d]).then((c) => {
                        this.zoomFaces[i] = c;
                        console.log('FaceCapture: Face Captured');
                        this.count++;
                    });
                    break;
                default:
                    break;
            }
        });
    }

    
}