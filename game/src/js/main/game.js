import * as Scene from './scene';
import FaceCapture from './capture-faces';
import * as Footballs from './footballs';
import getRandomInt from '../helper/randomInt';
import CONFIG from '../helper/config';
import * as message from './message';
import * as score from './score';
import * as Sound from './sound';
import * as Scoreboard from './scoreboard';
import * as State from '../helper/state';
import * as Logo from './logo';
import * as Fireworks from './fireworks';
import * as Media from './media';

let isInit = false;
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
        Media.init();
    }, CONFIG.idleTime); // Some time to allow for character reload
}

function runBalls() {
    score.showBoard();
    let timeElapsed = 0;
    let timeLoop = setInterval(() => {
        timeElapsed += 10;
        score.setTime(parseInt(score.time) + 10);
    },10);
    let gameLoop = setInterval(() => {
        new Footballs.Ball({x:getRandomInt(CONFIG.ballXRange.min,CONFIG.ballXRange.max), y:getRandomInt(CONFIG.ballYRange.min,CONFIG.ballYRange.max)}, false);
        if (score.score <= 0) {
            window.clearInterval(gameLoop);
            window.clearInterval(timeLoop);
            setTimeout(() => {
                Scene.stopDriving();
                score.hideBoard();
                setTimeout(() => { // Wait a bit more before resetting
                    Footballs.clearAll();
                    Logo.hide();
                    if (Sound.running) {
                        Sound.crowdCheer();
                    }
                    score.display();
                    Fireworks.display();
                }, CONFIG.postGameTime);
                setTimeout(() => { // Wait a bit more before resetting
                    message.hide();
                    Scoreboard.addToLeaderboard(score.time);
                    Scoreboard.showLeaderboard();
                }, CONFIG.postGameTime + (CONFIG.gameTime * 1.5));
                setTimeout(() => { // Wait a bit more before resetting
                    reset();
                }, CONFIG.postGameTime + (CONFIG.gameTime * 3));
            },500);
        }
        if (score.time > CONFIG.frenzyBallCount) {
            setTimeout(() => {
                if (!gameLoop) {
                    return;
                }
                new Footballs.Ball({x:getRandomInt(CONFIG.ballXRange.min,CONFIG.ballXRange.max), y:getRandomInt(CONFIG.ballYRange.min,CONFIG.ballYRange.max)}, false);
            }, CONFIG.ballFrequency / 3);
            setTimeout(() => {
                if (!gameLoop) {
                    return;
                }
                new Footballs.Ball({x:getRandomInt(CONFIG.ballXRange.min,CONFIG.ballXRange.max), y:getRandomInt(CONFIG.ballYRange.min,CONFIG.ballYRange.max)}, false);
            }, CONFIG.ballFrequency / 2);
        } else if (score.time > CONFIG.mediumBallCount) {
            setTimeout(() => {
                if (!gameLoop) {
                    return;
                }
                new Footballs.Ball({x:getRandomInt(CONFIG.ballXRange.min,CONFIG.ballXRange.max), y:getRandomInt(CONFIG.ballYRange.min,CONFIG.ballYRange.max)}, false);
            }, CONFIG.ballFrequency / 3);
        }
    },CONFIG.ballFrequency);
    // if (State.getStage() == 1) {
    //     setTimeout(() => { // Stop throwing balls
    //         if (Sound.running) {
    //             Sound.blowWhistle();
    //         }
    //         clearInterval(gameLoop);
    //         gameLoop = null;
    //         Footballs.clearAll();
    //         score.hideBoard();
    //         scoreGoal();
    //     }, CONFIG.gameTime);
    // } else if (State.getStage() == 2) {
    //     score.newStage();
    //     Scene.characters.forEach(c => {
    //         c.transparent();
    //     });
    //     setTimeout(() => { // Stop throwing balls
    //         clearInterval(gameLoop);
    //         gameLoop = null;
    //         if (Sound.running) {
    //             Sound.blowWhistle();
    //         }
    //         Footballs.clearAll();
    //     }, CONFIG.gameTime);
    //     setTimeout(() => { // Wait a bit before showing score
    //         Logo.hide();
    //         if (Sound.running) {
    //             Sound.crowdCheer();
    //         }
    //         score.display();
    //         Fireworks.display();
    //         setTimeout(() => {
    //             Fireworks.display();
    //         }, 400);
    //     }, CONFIG.gameTime * 1.2);
    //     setTimeout(() => { // Wait a bit more before resetting
    //         message.hide();
    //         Scoreboard.addToLeaderboard(score.score);
    //         Scoreboard.showLeaderboard();
    //     }, CONFIG.postGameTime + (CONFIG.gameTime * 1.5));
    //     setTimeout(() => { // Wait a bit more before resetting
    //         reset();
    //     }, CONFIG.postGameTime + (CONFIG.gameTime * 3));
    // }
}

function playGame(faces) {
    faces.forEach((d,i) => {
        if (typeof(Scene.characters[i]) == 'undefined') {
            return;
        }
        if (i + 1 > CONFIG.maxPlayers[Media.videoType]) {
            return;
        }
        if (i == 0) {
            Scene.characters[i].addToScene(Scene.scene);
            Scene.characters[i].show();
            console.log(`Player ${i + 1} is: ${Scene.characters[i].team}`);
            Scene.activePlayers.push(Scene.characters[i]);
        }
    });
    Footballs.setFaces(faces.slice(1, faces.length - 1));
    if (Media.videoType == 'zoom') {
        let remainingChars = CONFIG.characters.length - faces.length;
        // if (remainingChars > 0) {
        //     for (let i = faces.length;i < faces.length + remainingChars; i++) {
        //         Scene.characters[i].addToScene(Scene.scene);
        //         Scene.characters[i].giveFace(faces[getRandomInt(0, faces.length - 1)][0]);
        //         Scene.characters[i].show();
        //         console.log(`Player ${i + 1} is: ${Scene.characters[i].team}`);
        //         Scene.activePlayers.push(Scene.characters[i]);
        //             switch (i) {
        //                 case 0:
        //                 case 2:
        //                     Scene.poles[0].visible = true;
        //                     break;
        //                 case 1:
        //                     Scene.poles[1].visible = true;
        //                 default:
        //                     break;
        //             }
        //         }
        // }
    }
    if (!CONFIG.groupPlay) {
        Media.captureVideo(null, 'webcam');
    }
    Scene.start();
    movementIcon.classList.remove('fade');
    if (Sound.running) {
    }
    message.add('<h2>Start your engines!</h2>');
    message.show();
    setTimeout(() => {
        message.add('<h2>GO!</h2>');
        movementIcon.classList.add('fade');
    //     if (Sound.running) {
    //         Sound.blowWhistle();
    //     }
        Scene.startDriving();
        runBalls();
        setTimeout(message.hide, 1000);
    }, CONFIG.preGameTimer);
}

function detectionCallback(e) {
    e.idle = true;
    videoEl.classList.add('hide');
    message.hide();
    if (e.detections.length) {
        playGame(e.detections);
    } else if (e.zoomFaces.length && CONFIG.videoType == 'zoom') {
        console.log(e.zoomFaces);
        playGame(e.zoomFaces);
    } else {
        if (e.end) {
            // return;
        }
        idleScreen.style.display = 'flex';
        faces.startDetection(detectionCallback);
    }
}

function init(camera = true) {
    if (isInit) {
        return;
    }
    isInit = true;
    Scoreboard.init();

    // buildScene
    if (CONFIG.playSound) {
        Sound.init();
    }
    Scene.init();
    Footballs.init();
    if (camera) {
        faces = new FaceCapture(videoEl);
        faces.load(() => {
            faces.startDetection(detectionCallback);
        });
    } else {
        setTimeout(() => {
            idleScreen.style.display = 'none';
            detectionCallback({
                detections: [[null]]
            });
        }, CONFIG.idleTime);
    }
    // startFaceDetect

    window.addEventListener('resize', () => {location.reload()}, false);
}

videoEl.addEventListener('loadedmetadata', init, false);

export {
    init
}