import CONFIG from '../helper/config';

let logo;

function show() {
    logo = document.createElement('img');
    logo.src = CONFIG.logo;
    logo.classList.add('logo');
    document.body.appendChild(logo);
}

function hide() {
    if (logo) {
        document.body.removeChild(logo);
    }
}

export {
    show,
    hide
}