import * as Scene from './scene';
// import * as Posenet from './posenet';
import FaceCapture from './capture-faces';
import * as Footballs from './footballs';
import getRandomInt from '../helper/randomInt';
import CONFIG from '../helper/config';
import * as message from './message';
import * as score from './score';
import * as Sound from './sound';
import * as Scoreboard from './scoreboard';
import * as State from '../helper/state';
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
    message.popdown();
    message.hide();
    Scoreboard.hideLeaderboard();
    faces.clear();
    score.reset();
    Scene.reset();
    State.setStage(1);
    idleScreen.style.display = 'flex';
    setTimeout(() => {
        faces.startDetection(detectionCallback);
    }, CONFIG.idleTime); // Some time to allow for character reload
}

function scoreGoal() {
    State.setStage(2);
    Scene.stageTwo();
    runBalls();
}

function runBalls() {
    // message.add(`0 points scored`);
    // message.show();
    score.showBoard();
    let gameLoop = setInterval(() => {
        new Footballs.Ball({x:getRandomInt(-13,0), y:getRandomInt(-4,4)}, State.getStage() == 1);
    },CONFIG.ballFrequency);
    if (State.getStage() == 1) {
        setTimeout(() => { // Stop throwing balls
            clearInterval(gameLoop);
            Footballs.clearAll();
            scoreGoal();
        }, CONFIG.gameTime);
    } else if (State.getStage() == 2) {
        setTimeout(() => { // Stop throwing balls
            clearInterval(gameLoop);
            Footballs.clearAll();
        }, CONFIG.gameTime);
        setTimeout(() => { // Wait a bit before showing score
            if (Sound.running) {
                Sound.fanfare();
            }
            score.display();
        }, CONFIG.gameTime * 1.2);
        setTimeout(() => { // Wait a bit more before resetting
            Scoreboard.addToLeaderboard(score.score);
            Scoreboard.showLeaderboard();
        }, CONFIG.postGameTime + (CONFIG.gameTime * 1.5));
        setTimeout(() => { // Wait a bit more before resetting
            reset();
        }, CONFIG.postGameTime + (CONFIG.gameTime * 3));
    }
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
            console.log(`Player ${i + 1} is: ${Scene.characters[i].team}`);
            Scene.activePlayers.push(Scene.characters[i]);
        });
        Scene.start();
        movementIcon.classList.remove('fade');
        if (Sound.running) {
            Sound.chant();
        }
        setTimeout(() => {
            movementIcon.classList.add('fade');
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
    Scoreboard.init();

    // buildScene
    if (CONFIG.playSound) {
        Sound.init();
    }
    Scene.init();
    Footballs.init();

    // startFaceDetect
    faces = new FaceCapture(videoEl);
    faces.load(() => {
        faces.startDetection(detectionCallback);
    })
}

videoEl.addEventListener('loadedmetadata', init, false);