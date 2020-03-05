export default function captureVideo() {

    videoEl.width = window.innerWidth;
    videoEl.height = window.innerHeight;
    
    navigator.mediaDevices.getUserMedia({video: {
        width: {max: window.innerWidth},
        height: {max: window.innerHeight}
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