import 'regenerator-runtime/runtime';
import captureVideo from './video-capture';

let videoEl = null;

function main() {
    let posenet = new Worker('./dist/js/posenet.js');
    videoEl = captureVideo();
    videoEl.addEventListener('loadeddata', async () => {
        posenet.postMessage({
            action: 'init',
            canvasSize: {
                width: videoEl.width,
                height: videoEl.height
            }
        });
        let canvas = usercanvas.transferControlToOffscreen();
        let scene = new Worker('./dist/js/scene.js');
        // let sceneApi = comlink.wrap(scene);
        // await sceneApi.init(comlink.transfer(canvas, [canvas]));
        scene.postMessage({
            action: 'init',
            canvas: canvas,
            width: window.innerWidth,
            height: window.innerHeight
        },[canvas]);
        posenet.addEventListener('message', (e) => {
            let poses = e.data.poses;
            scene.postMessage({
                action: 'send_poses',
                poses: poses
            });
        });
        let videoCanvas = new OffscreenCanvas(videoEl.width,videoEl.height);
        let offCtx = videoCanvas.getContext('2d');
        async function sendVideo() {
            offCtx.clearRect(0,0,videoEl.width,videoEl.height);
            offCtx.drawImage(videoEl,0,0);
            const bitmap = videoCanvas.transferToImageBitmap();
            posenet.postMessage({ 
                video: bitmap,
                action: 'send_video'
            },[bitmap]);
            posenet.postMessage({ 
                action: 'get_poses'
            });
            requestAnimationFrame(sendVideo);
        }
        sendVideo();
    }, false);

    const haptics = new Worker('./dist/js/haptics.js');
    haptics.postMessage({
        action: 'init',
    });
}

export {
    main
}