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
        <h2>Let's play Foosball!</h2>
        <ol style='text-align: left;'>
            <li>Share your screen in zoom<br /><br /></li>
            <li>Click start<br /><br /></li>
            <li>After the game starts, blindfold the host player (person sharing their screen) & direct them to move the players by leaning left/right<br /><br /></li>
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