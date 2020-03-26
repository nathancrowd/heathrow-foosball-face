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
    }).then(res => {console.log(res.json())});
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
    let mostRecent = null;
    scores.forEach((s,i) => {
        if (i > 9) {
            return;
        }
        let scoreItem = document.createElement('li');
        let images = [];
        if (s.faces) {
            s.faces.forEach(f => {
                let i = new Image();
                i.src = f;
                images.push(i);
            });
        }
        scoreItem.innerHTML = `
        <figure></figure>
        <p>${s.score} points</p>`;
        let fig = scoreItem.querySelector('figure');
        images.forEach(i => {
            fig.appendChild(i);
        });
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
function addToLeaderboard(faces, score) {
    let retF = [];
    faces.forEach(f => {
        retF.push(f[0].toDataURL());
    });
    let entry = {
        faces: retF,
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