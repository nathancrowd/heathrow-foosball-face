export default function captureVideo() {

    videoEl.width = window.innerWidth;
    videoEl.height = window.innerHeight;
    
    navigator.mediaDevices.getUserMedia({video: {
        aspectRatio: 0.5625
    }}).then(s => {
        videoEl.srcObject = s;
        videoEl.onloadedmetadata = () => {
             videoEl.play();
        };
    }).catch(e => {
        console.error(e);
    });
}

document.addEventListener('DOMContentLoaded', captureVideo, false);