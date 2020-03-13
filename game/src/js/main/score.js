import * as message from './message';
let score = 0;

function increment() {
    score++;
    // message.show();
    showBoard();
    updateBoard(score);
    // message.add(`${score} points scored`);
}

function display() {
    hideBoard();
    message.show();
    message.popup();
    message.add(`Time is up. ${score} points scored. Well done!`);
}

function reset() {
    score = 0;
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
    showBoard,
    display,
    reset
}