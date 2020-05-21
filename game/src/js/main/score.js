import * as message from './message';
import CONFIG from '../helper/config';
import convertMs from '../helper/convertMs';

let score = CONFIG.lives;
let stageScore = 0;
let time = '0:00';
let faces = '';

function increment() {
    score++;
    stageScore++;
    showBoard();
    updateBoard();
}

function decrement() {
    if (score > 0) {
        score--;
        stageScore--;
    }
    showBoard();
    updateBoard();
}

function setTime(newTime) {
    time = `${convertMs(newTime).minute}:${convertMs(newTime).seconds < 10 ? `0${convertMs(newTime).seconds}` : convertMs(newTime).seconds}`;
    updateBoard();
}

function display() {
    hideBoard();
    message.show();
    message.popup();
    message.add(`<h2 class='final'>And that's the final whistle!</h2><p>You scored</p><span class='number'>${score}</span><p>Goals</p><h2>Well done!</h2>`);
}

function newStage() {
    stageScore = 0;
}

function reset() {
    score = 0;
    stageScore = 0;
    updateBoard();
    hideBoard();
}

function showBoard() {
    scoreboard.style.display = 'flex';
}

function updateBoard() {
    scoreboard.innerHTML = `<span>${time}</span><span>${score}</span>`;
}

function hideBoard() {
    scoreboard.style.display = 'none';
}

export {
    increment,
    decrement,
    score,
    stageScore,
    newStage,
    showBoard,
    hideBoard,
    display,
    reset,
    setTime,
    time
}