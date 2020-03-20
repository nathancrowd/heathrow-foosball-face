function add(message) {
    messageBox.innerHTML = `<h2>${message}</h2>`;
}

function show() {
    messageBox.style.display = 'flex';
}

function hide() {
    messageBox.style.display = 'none';
}

function popup() {
    messageBox.classList.add('popup');
}

function popdown() {
    messageBox.classList.remove('popup');
}

export {
    add,
    show,
    hide,
    popup,
    popdown
}