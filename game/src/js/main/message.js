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
            <li>Share your screen in zoom, and make sure the overlay with other people's video feeds is visible.<br /><br /></li>
            <li>Click start, and allow Chrome to share your screen.<br /><br /></li>
            <li>After loading, get everyone ready to make their game faces!<br /><br /></li>
            <li>After the game starts, move the players by leaning left/right. Keep an eye out for your friends on the pitch...<br /><br /></li>
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