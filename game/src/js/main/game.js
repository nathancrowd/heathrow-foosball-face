import * as Scene from './scene';
import * as Posenet from './posenet';
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
        Footballs.createBall({x:getRandomInt(-35,22), y:getRandomInt(-4,4)});
    },CONFIG.ballFrequency);
    setTimeout(() => {
        clearInterval(gameLoop);
        score.display();
        setTimeout(() => {
            reset();
        }, CONFIG.postGameTime);
    }, CONFIG.gameTime);
}

function detectionCallback(e) {
    e.idle = true;
    videoEl.classList.add('hide');
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
    Posenet.init();

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