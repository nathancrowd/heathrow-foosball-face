import captureVideo from './video-capture';
import FaceCapture from './capture-faces';

document.addEventListener('DOMContentLoaded', () => {

    let videoEl = captureVideo();

    videoEl.addEventListener('loadeddata', () => {
        setTimeout(() => {
            new FaceCapture(videoEl).then((faces) => {
                console.log(faces.returnCanvases());
            });
        }, 5000);
    }, false);


}, false);