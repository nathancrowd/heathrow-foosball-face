function add(message) {
    messageBox.innerHTML = message;
}

function show() {
    messageBox.style.display = 'block';
}

function hide() {
    messageBox.style.display = 'none';
}

export {
    add,
    show,
    hide
}