import * as message from './message';
import CONFIG from '../helper/config';
import convertMs from '../helper/convertMs';

let score = CONFIG.lives;
let stageScore = 0;
let time = 0;
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
    time = `${newTime < 1000000 ? '0' : ''}${newTime < 100000 ? '0' : ''}${newTime < 10000 ? '0' : ''}${newTime < 1000 ? '0' : ''}${newTime < 100 ? '0' : ''}${newTime < 10 ? '0' : ''}${newTime < 1 ? '0' : ''}${newTime}`;
    updateBoard();
}

function display() {
    hideBoard();
    message.show();
    message.popup();
    message.add(`<h2 class='final'>you crashed out!</h2><p>Score: </p><span class='number'>${time}</span><h2>Well done!</h2>`);
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