import * as Scene from './scene';
// import * as Posenet from './posenet';
import FaceCapture from './capture-faces';
import * as Footballs from './footballs';
import getRandomInt from '../helper/randomInt';
import CONFIG from '../helper/config';
import * as message from './message';
import * as score from './score';
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

let faces = null;

function reset() {
    message.hide();
    score.reset();
    Scene.reset();
    idleScreen.style.display = 'flex';
    setTimeout(() => {
        faces.startDetection(detectionCallback);
    }, CONFIG.idleTime); // Some time to allow for character reload
}

function runBalls() {
    message.add(`0 points scored`);
    message.show();
    let gameLoop = setInterval(() => {
        new Footballs.Ball({x:getRandomInt(-13,0), y:getRandomInt(-4,4)});
    },CONFIG.ballFrequency);
    setTimeout(() => { // Stop throwing balls
        clearInterval(gameLoop);
        Footballs.clearAll();
    }, CONFIG.gameTime);
    setTimeout(() => { // Wait a bit before showing score
        score.display();
    }, CONFIG.gameTime * 1.2);
    setTimeout(() => { // Wait a bit more before resetting
        reset();
    }, CONFIG.postGameTime + (CONFIG.gameTime * 1.5));
}

function detectionCallback(e) {
    e.idle = true;
    videoEl.classList.add('hide');
    message.hide();
    if (e.detections.length) {
        e.detections.forEach((d,i) => {
            Scene.characters[i].addToScene(Scene.scene);
            Scene.characters[i].giveFace(d[0]);
            Scene.characters[i].show();
            Scene.activePlayers.push(Scene.characters[i]);
        });
        e.clear();
        Scene.start();
        setTimeout(() => {
            runBalls();
        }, CONFIG.preGameTimer);
    } else {
        if (e.end) {
            // return;
        }
        idleScreen.style.display = 'flex';
        faces.startDetection(detectionCallback);
    }
}

function init() {
    // runIdle
    message.hide();
    // loadPosenet (idle)

    // buildScene
    Scene.init();
    Footballs.init();

    // startFaceDetect
    faces = new FaceCapture(videoEl);
    faces.load(() => {
        faces.startDetection(detectionCallback);
    })
        
    // Scene: hide
    
    // playEndVideo

    // Scene: clear
}

videoEl.addEventListener('loadedmetadata', init, false);