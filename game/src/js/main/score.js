import * as message from './message';
let score = 0;
let stageScore = 0;
let time = '0:00';
let faces = '';

function increment() {
    scoreboard.classList.add('inc');
    score++;
    stageScore++;
    showBoard();
    updateBoard();
    setTimeout(() => {
        scoreboard.classList.remove('inc');
    }, 300);
}

function decrement() {
    scoreboard.classList.add('dec');
    score--;
    stageScore--;
    showBoard();
    updateBoard();
    setTimeout(() => {
        scoreboard.classList.remove('dec');
    }, 300);

}

function setTime(newTime) {
    time = `0:${newTime < 10 ? 0 : ''}${newTime}`;
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
    scoreboard.appendChild(faces);
}

function hideBoard() {
    scoreboard.style.display = 'none';
}

function setFaces(detections) {
    let facesEl = document.createElement('div');
    detections.forEach(d => {
        if (d[0]) {
            facesEl.appendChild(d[0]);
        }
    });
    faces = facesEl;
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
    setFaces
}