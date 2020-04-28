import CONFIG from '../helper/config';
import * as Game from './game';
let imageCapture = null;

function captureVideo() {

    videoEl.width = window.innerWidth;
    videoEl.height = window.innerHeight;

    let constrainFront = null;

    if (CONFIG.mobile) {
        constrainFront = { exact: "user" };
    }
    
    navigator.mediaDevices.getUserMedia({video: {
        aspectRatio: window.innerWidth / window.innerHeight,
        facingMode: constrainFront
    }}).then(s => {
        videoEl.srcObject = s;
        videoEl.onloadedmetadata = () => {
             videoEl.play();
        };
        let track = s.getVideoTracks()[0];
        if (!CONFIG.mobile) {
            imageCapture = new ImageCapture(track);
        }
        
    }).catch(e => {
        console.error(e);
        Game.init(false);
    });
}

export {
    captureVideo,
    imageCapture
}

document.addEventListener('DOMContentLoaded', captureVideo, false);