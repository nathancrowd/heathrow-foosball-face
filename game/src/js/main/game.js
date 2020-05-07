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

function scoreGoal() {
    State.setStage(2);
    Scene.stageTwo();
    setTimeout(() => {
        if (Sound.running) {
            Sound.blowWhistle();
        }
        runBalls();
    }, CONFIG.gameTime * 0.2);
}

function runBalls() {
    score.showBoard();
    let timeElapsed = 0;
    let gameLoop = setInterval(() => {
        timeElapsed += CONFIG.ballFrequency;
        new Footballs.Ball({x:getRandomInt(-13,0), y:getRandomInt(-4,4)}, false);
        score.setTime((CONFIG.gameTime - timeElapsed) / 1000);
        if (score.stageScore > CONFIG.frenzyBallCount) {
            setTimeout(() => {
                if (!gameLoop) {
                    return;
                }
                new Footballs.Ball({x:getRandomInt(-13,0), y:getRandomInt(-4,4)}, false);
            }, CONFIG.ballFrequency / 3);
            setTimeout(() => {
                if (!gameLoop) {
                    return;
                }
                new Footballs.Ball({x:getRandomInt(-13,0), y:getRandomInt(-4,4)}, false);
            }, CONFIG.ballFrequency / 2);
        } else if (score.stageScore > CONFIG.mediumBallCount) {
            setTimeout(() => {
                if (!gameLoop) {
                    return;
                }
                new Footballs.Ball({x:getRandomInt(-13,0), y:getRandomInt(-4,4)}, false);
            }, CONFIG.ballFrequency / 3);
        }
    },CONFIG.ballFrequency);
    if (State.getStage() == 1) {
        setTimeout(() => { // Stop throwing balls
            if (Sound.running) {
                Sound.blowWhistle();
            }
            clearInterval(gameLoop);
            gameLoop = null;
            Footballs.clearAll();
            score.hideBoard();
            scoreGoal();
        }, CONFIG.gameTime);
    } else if (State.getStage() == 2) {
        score.newStage();
        Scene.characters.forEach(c => {
            c.transparent();
        });
        setTimeout(() => { // Stop throwing balls
            clearInterval(gameLoop);
            gameLoop = null;
            if (Sound.running) {
                Sound.blowWhistle();
            }
            Footballs.clearAll();
        }, CONFIG.gameTime);
        setTimeout(() => { // Wait a bit before showing score
            Logo.hide();
            if (Sound.running) {
                Sound.crowdCheer();
            }
            score.display();
            Fireworks.display();
            setTimeout(() => {
                Fireworks.display();
            }, 400);
        }, CONFIG.gameTime * 1.2);
        setTimeout(() => { // Wait a bit more before resetting
            message.hide();
            Scoreboard.addToLeaderboard(score.score);
            Scoreboard.showLeaderboard();
        }, CONFIG.postGameTime + (CONFIG.gameTime * 1.5));
        setTimeout(() => { // Wait a bit more before resetting
            reset();
        }, CONFIG.postGameTime + (CONFIG.gameTime * 3));
    }
}

function playGame(faces) {
    faces.forEach((d,i) => {
        if (typeof(Scene.characters[i]) == 'undefined') {
            return;
        }
        Scene.characters[i].addToScene(Scene.scene);
        Scene.characters[i].giveFace(d[0]);
        Scene.characters[i].show();
        console.log(`Player ${i + 1} is: ${Scene.characters[i].team}`);
        Scene.activePlayers.push(Scene.characters[i]);
        switch (i) {
            case 0:
            case 2:
                Scene.poles[0].visible = true;
                break;
            case 1:
                Scene.poles[1].visible = true;
            default:
                break;
        }
    });
    if (Media.videoType == 'zoom') {
        let remainingChars = CONFIG.characters.length - faces.length;
        if (remainingChars > 0) {
            for (let i = faces.length;i < faces.length + remainingChars; i++) {
                Scene.characters[i].addToScene(Scene.scene);
                Scene.characters[i].giveFace(faces[getRandomInt(0, faces.length - 1)][0]);
                Scene.characters[i].show();
                console.log(`Player ${i + 1} is: ${Scene.characters[i].team}`);
                Scene.activePlayers.push(Scene.characters[i]);
                    switch (i) {
                        case 0:
                        case 2:
                            Scene.poles[0].visible = true;
                            break;
                        case 1:
                            Scene.poles[1].visible = true;
                        default:
                            break;
                    }
                }
        }
    }
    if (!CONFIG.groupPlay) {
        Media.captureVideo(null, 'webcam');
    }
    score.setFaces(faces);
    Scene.start();
    movementIcon.classList.remove('fade');
    if (Sound.running) {
    }
    setTimeout(() => {
        movementIcon.classList.add('fade');
        if (Sound.running) {
            Sound.blowWhistle();
        }
        runBalls();
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