import * as Scene from './scene';
import FaceCapture from './capture-faces';
/**
 * Scene
 */

// build
    // loadModels

// show
    // showScene
    // startPosenet
    // playGestureSequence
        // TODO: Decide gestures
    // playGame (30 seconds)
        // throwBalls
    // showScore

// hide

// clear
    // removeBalls
    // removeFaces
    // stopPosenet

function init() {
    // runIdle

    // loadPosenet (idle)

    // buildScene
    Scene.init();

    // startFaceDetect
    new FaceCapture(videoEl,(e) => {
        e.idle = true;
        if (e.detections.length) {
            e.endDetection();
            e.detections.forEach((d,i) => {
                Scene.characters[i].giveFace(d[0]);
                Scene.characters[i].show();
            });
            videoEl.classList.add('hide');
            Scene.start();
            // save faces
            // add faces to characters
            // show scene
        } else {
            idleScreen.style.display = 'flex';
        }
    });
        
    // Scene: hide
    
    // playEndVideo

    // Scene: clear
}

document.addEventListener('DOMContentLoaded', init, false);