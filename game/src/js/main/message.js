import * as Blur from './blur';

function add(message) {
    messageBox.innerHTML = `${message}`;
}

function show() {
    messageBox.style.display = 'flex';
}

function hide() {
    messageBox.style.display = 'none';
}

function popup() {
    messageBox.classList.add('popup');
    Blur.show();
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
    popdown
}