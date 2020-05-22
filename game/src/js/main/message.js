import * as Blur from './blur';

function add(message) {
    messageBox.innerHTML = `${message}`;
}

function show() {
    messageBox.style.display = 'flex';
}

function hide() {
    messageBox.classList.remove('popup');
    messageBox.style.display = 'none';
    Blur.hide();
}

function popup() {
    messageBox.classList.add('popup');
    Blur.show();
}

function gameType() {
    messageBox.classList.add('popup');
    add(`
        <h2>Zoomracer</h2>
        <ol style='text-align: left;'>
            <li>Share your screen in zoom<br /><br /></li>
            <li>Click start, allow Chrome to share your screen<br /><br /></li>
            <li>Steer the car by leaning left/right, avoiding obstacles as you do.<br /><br /></li>
        </ol>
        <button id='solo' style='display: none;'>Solo Game</button>
        <button id='multi'>Start!</button>
    `);
    Blur.show();
    show();
}

function popdown() {
    messageBox.classList.remove('popup');
    Blur.hide();
}

export {
    add,
    show,
    hide,
    popup,
    popdown,
    gameType
}