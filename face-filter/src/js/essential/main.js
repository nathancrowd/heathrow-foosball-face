import captureVideo from './video-capture';
import FaceCapture from './capture-faces';
import {createScene, addFace} from './scene';

document.addEventListener('DOMContentLoaded', () => {

    let videoEl = captureVideo();

    createScene();

    videoEl.addEventListener('loadeddata', () => {
        setTimeout(() => {
            new FaceCapture(videoEl).then((faces) => {
                if (faces.detections.length) {
                    faces.detections.forEach((c,i) => {
                        addFace(c[0],i);
                    });
                }
            });
        }, 5000);
    }, false);


}, false);