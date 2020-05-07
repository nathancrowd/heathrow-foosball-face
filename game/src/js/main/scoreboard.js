let scores = [];
let board = null;
let currentScoreTimestamp = null;
const DATAURL = 'https://www.sfpanel.com/foosball/data/';

async function getScores() {
    let data = await fetch(DATAURL).then(res => {
        return res.json();
    }).then(data => {
        return data;
    });

    scores = data.scores;
}

async function postScore(score) {
    await fetch(DATAURL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(score)
    });
}

import * as Blur from './blur';

function init() {
    getScores();
}

function showLeaderboard() {
    if (board) {
        hideLeaderboard();
    }
    board = document.createElement('ul');
    board.classList.add('leaderboard');
    let frag = new DocumentFragment();
    let title = document.createElement('h2');
    title.innerHTML = 'Leaderboard'
    frag.appendChild(title);
    scores.forEach((s,i) => {
        if (i > 9) {
            return;
        }
        let scoreItem = document.createElement('li');
        if (s.timestamp) {
            if (s.timestamp == currentScoreTimestamp) {
                scoreItem.classList.add('new');
            }
        }
        scoreItem.innerHTML = `<p class='index'>#${i + 1}</p><p class='score'>${s.score} goals</p>`;
        frag.appendChild(scoreItem);
    });
    board.appendChild(frag);
    document.body.appendChild(board);
    Blur.show();
}

function hideLeaderboard() {
    board.parentElement.removeChild(board);
    Blur.hide();
    board = null;
}

function sortScores() {
    scores.sort((a,b) => {
        if (a.score > b.score) {
            return -1;
        }
        if (a.score < b.score) {
            return 1;
        }
        return 0;
    });
    localStorage.setItem('foosballLeaderboard', JSON.stringify(scores));
}

/**
 * 
 * @param {Array} faces An array of FaceApi faces
 * @param {Integer} score Number of points scored
 */
function addToLeaderboard(score) {
    let timestamp = Date.now();
    currentScoreTimestamp = timestamp;
    let entry = {
        score: score,
        timestamp: timestamp
    }
    postScore(entry);
    scores.push(entry);
    sortScores();
}

export {
    init,
    addToLeaderboard,
    showLeaderboard,
    hideLeaderboard
}