export default function captureVideo() {
    const videoEl = document.querySelector('#user-video');

    videoEl.width = window.innerWidth;
    videoEl.height = window.innerHeight;
    
    navigator.mediaDevices.getUserMedia({video: {}}).then(s => {
        videoEl.srcObject = s;
        videoEl.onloadedmetadata = () => {
             videoEl.play();
        };
    }).catch(e => {
        console.error(e);
    });

    return videoEl;
}