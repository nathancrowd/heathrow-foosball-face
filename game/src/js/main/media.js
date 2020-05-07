import CONFIG from '../helper/config';
import * as Game from './game';
import * as Message from './message';
let imageCapture = null;
let videoType = null;

async function captureVideo(e, type = (type ? type : null)) {
    videoType = type || CONFIG.videoType;
    console.log(`Media: Capturing ${videoType}`);

    videoEl.width = window.innerWidth;
    videoEl.height = window.innerHeight;

    let constrainFront = null;

    if (CONFIG.mobile) {
        constrainFront = { exact: "user" };
    }

    switch (videoType) {
        case 'webcam':
            navigator.mediaDevices.getUserMedia({video: {
                aspectRatio: window.innerWidth / window.innerHeight,
                facingMode: constrainFront
            }}).then(s => {
                videoEl.srcObject = s;
                setupTrack();
            }).catch(e => {
                console.error(e);
                Game.init(false);
            });
            break;
        case 'zoom':
            videoEl.srcObject = await navigator.mediaDevices.getDisplayMedia({
                cursor: 'never',
                audio: false
            });
            videoEl.style.opacity = 0;
            setupTrack();
            break;
        default:
            break;
    }
    
}

function setupTrack() {
    let track = videoEl.srcObject.getVideoTracks()[0];
    if (!CONFIG.mobile) {
        imageCapture = new ImageCapture(track);
    }
    videoEl.onloadedmetadata = () => {
        videoEl.play();
    };
}

function init() {
    Message.gameType();
    if (solo) {
        solo.addEventListener('click', () => {
            captureVideo(null, 'webcam');
            Message.hide();
        }, false);
    }
    if (multi) {
        multi.addEventListener('click', () => {
            Message.hide();
            Message.add('<h2>Loading</h2>');
            Message.popup();
            Message.show();
            captureVideo(null, 'zoom');
        }, false);
    }
}

export {
    captureVideo,
    imageCapture,
    videoType,
    init
}

document.addEventListener('DOMContentLoaded', init, false);