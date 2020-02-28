import captureVideo from './video-capture';
import FaceCapture from './capture-faces';
import {createScene, addFace} from './scene';

document.addEventListener('DOMContentLoaded', () => {

    let videoEl = captureVideo();

    createScene();

    videoEl.addEventListener('loadeddata', () => {
        setTimeout(() => {
            new FaceCapture(videoEl).then((faces) => {                
                faces.returnCanvases((canvases) => {
                    addFace(canvases[0][0]);
                });
            });
        }, 5000);
    }, false);


}, false);