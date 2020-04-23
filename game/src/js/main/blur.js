const blur = document.createElement('div');
blur.classList.add('blur');
let active = false;

function show () {
    if (!active) {
        document.body.appendChild(blur);
        active = true;
    }
}

function hide () {
    if (active) {
        document.body.removeChild(blur);
        active = false;
    }
}

export {
    hide,
    show
}