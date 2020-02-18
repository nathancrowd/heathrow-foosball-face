let THREECAMERA = null;
let renderScene = null;
let faceRenderer = null;
let renderCamera = null;

let cutter = null;
let pasteCanvas = null;
let paster = null;

let video = null;

let faces = [];

async function init(videoSettings) {
    video = document.querySelector('video');
    
    const MODEL_URL = '/models';

    // Load faceapi supplied facial recognition models
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
    await faceapi.loadAgeGenderModel(MODEL_URL)

    // Detect faces, and save them as canvases
    let fullFaceDescriptions = await faceapi.detectAllFaces(userVideo).withFaceLandmarks().withFaceDescriptors();
    // fullFaceDescriptions = faceapi.resizeResults(fullFaceDescriptions,{ width: video.width, height: video.height });
    fullFaceDescriptions.forEach(async d => {
        await faceapi.extractFaces(userVideo, [d.detection])
            .then(r => {
                faces.push(r[0]);
            });
    });

    // Init Jeeliz
    JEEFACEFILTERAPI.init({
        canvasId: 'facecanvas',
        NNCpath: './dist/', //path to JSON neural network model (NNC.json by default)
        maxFacesDetected: 3,
        videoSettings: {
            videoElement: video // We want to run on the supplied video, not the webcam
        },
        callbackReady: (errCode, spec) => {
            if (errCode){
                console.log('AN ERROR HAPPENS. ERROR CODE =', errCode);
                return;
            }
            // [init scene with spec...]
            createScene(spec);
            console.log('INFO: JEEFACEFILTERAPI IS READY');
        }, //end callbackReady()
    
        //called at each render iteration (drawing loop)
        callbackTrack: detectState => {
            // Render your scene here
            // [... do something with detectState]
            THREE.JeelizHelper.render(detectState, THREECAMERA);
        } //end callbackTrack()
    });//end init call
}

function createScene(spec) {
    // Use helper to create Object3D where faces exist
    const threeStuffs = THREE.JeelizHelper.init(spec, detectCallback);

    threeStuffs.faceObjects.forEach((f,i) => {

        // Create 3D object with our user's face as the texture

        // TODO: where there are more faces in the video than there are users, map a single user's face onto ALL faces in the video
        let texture = new THREE.CanvasTexture(faces[i]);
        let geometry = new THREE.PlaneGeometry(1,1,1);
        let material = new THREE.MeshBasicMaterial({
            map: texture
        });
        let mesh = new THREE.Mesh(geometry, material);

        // Add to the face object
        f.add(mesh);
    });
    
    //CREATE THE CAMERA
    THREECAMERA = THREE.JeelizHelper.create_camera();
}

function detectCallback(faceIndex, isDetected) {
    if (isDetected) {
        console.log('INFO in detect_callback() : DETECTED');
    } else {
        console.log('INFO in detect_callback() : LOST');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    JeelizResizer.size_canvas({
        canvasId: 'facecanvas',
        callback: function(isError, bestVideoSettings){
        }
    })

    // Capture user's video in <video> element to detect faces.
    userVideo = document.querySelector('video.user-video');
    navigator.getUserMedia({video: {}},async s => {
        userVideo.srcObject = s;
        userVideo.onloadedmetadata = async e => {
             userVideo.play();
             init();
        };
    }, e => {
        console.error(e);
    });
})