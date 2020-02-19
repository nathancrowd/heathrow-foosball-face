export default function captureVideo() {
    const videoEl = document.querySelector('#user-video');

    videoEl.width = window.innerWidth;
    videoEl.height = window.innerHeight;

    navigator.getUserMedia({video: {}},s => {
        videoEl.srcObject = s;
        videoEl.onloadedmetadata = () => {
             videoEl.play();
        };
    }, e => {
        console.error(e);
    });
}