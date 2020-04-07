import * as message from './message';
let score = 0;
let stageScore = 0;

function increment() {
    score++;
    stageScore++;
    // message.show();
    showBoard();
    updateBoard(score);
    // message.add(`${score} points scored`);
}

function display() {
    hideBoard();
    message.show();
    message.popup();
    message.add(`<h2>Time is up!</h2><p>You scored</p><span class='number'>${score}</span><p>Goals</p><h2>Well done!</h2>`);
}

function newStage() {
    stageScore = 0;
}

function reset() {
    score = 0;
    stageScore = 0;
    updateBoard(score);
    hideBoard();
}

function showBoard() {
    scoreboard.style.display = 'block';
}

function updateBoard(score) {
    scoreboard.innerHTML = `${score}`;
}

function hideBoard() {
    scoreboard.style.display = 'none';
}

export {
    increment,
    score,
    stageScore,
    newStage,
    showBoard,
    display,
    reset
}