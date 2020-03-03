class Score {
    constructor(element) {
        this.element = element;
        this.score = 0;
    }

    increment() {
        this.score++;
        this.element.innerHTML = this.score;
    }
}
let RedScore = null;
let BlueScore = null;
document.addEventListener('DOMContentLoaded', () => {
    RedScore = new Score(document.querySelector('.score--red'));
    BlueScore = new Score(document.querySelector('.score--blue'));
}, false);

export {
    RedScore,
    BlueScore
}