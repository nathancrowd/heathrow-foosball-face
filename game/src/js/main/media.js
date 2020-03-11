import CONFIG from '../helper/config';
let imageCapture = null;

function captureVideo() {

    videoEl.width = window.innerWidth;
    videoEl.height = window.innerHeight;

    let constrainFront = null;

    if (CONFIG.mobile) {
        constrainFront = { exact: "user" };
    }
    
    navigator.mediaDevices.getUserMedia({video: {
        aspectRatio: 0.5625,
        facingMode: constrainFront
    }}).then(s => {
        videoEl.srcObject = s;
        videoEl.onloadedmetadata = () => {
             videoEl.play();
        };
        let track = s.getVideoTracks()[0];
        imageCapture = new ImageCapture(track);
        
    }).catch(e => {
        console.error(e);
    });
}

export {
    captureVideo,
    imageCapture
}

document.addEventListener('DOMContentLoaded', captureVideo, false);