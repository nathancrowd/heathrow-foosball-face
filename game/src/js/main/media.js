let imageCapture = null;

function captureVideo() {

    videoEl.width = window.innerWidth;
    videoEl.height = window.innerHeight;
    
    navigator.mediaDevices.getUserMedia({video: {
        aspectRatio: 0.5625,
        facingMode: null
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