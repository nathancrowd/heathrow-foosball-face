import * as message from './message';
let score = 0;

function increment() {
    score++;
    message.show();
    message.add(`${score} points scored`);
}

function display() {
    message.add(`Time is up. ${score} points scored. Well done!`);
}

function reset() {
    score = 0;
}

export {
    increment,
    score,
    display,
    reset
}