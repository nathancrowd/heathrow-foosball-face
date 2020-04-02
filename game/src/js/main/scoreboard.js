let scores = [];
let board = null;
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
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(score)
    });
}

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
    let mostRecent = null;
    scores.forEach((s,i) => {
        if (i > 9) {
            return;
        }
        let scoreItem = document.createElement('li');
        scoreItem.innerHTML = `<p class='index'>#${i + 1}</p><p class='score'>${s.score} goals</p>`;
        frag.appendChild(scoreItem);
        if (!s.timestamp) {
            return;
        }
        if (!mostRecent || !scores[mostRecent].timestamp) {
            mostRecent = i;
        }
        if (s.timestamp > scores[mostRecent].timestamp) {
            mostRecent = i;
        }
    });
    [].slice.call(frag.querySelectorAll('li'))[mostRecent].classList.add('new');
    board.appendChild(frag);
    document.body.appendChild(board);
}

function hideLeaderboard() {
    board.parentElement.removeChild(board);
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
    let entry = {
        score: score,
        timestamp: Date.now()
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