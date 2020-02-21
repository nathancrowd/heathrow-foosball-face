import 'regenerator-runtime/runtime';
import * as THREE from 'three';
import Character from './character';
import * as posenet from '@tensorflow-models/posenet';
import captureVideo from './video-capture';
import {OrbitControls} from './OrbitControls';
import * as faces from './faces';

// const netArchitecture = 'MobileNetV1'; // Light but inaccurate
const netArchitecture = 'ResNet50'; // Heavy but more accurate
const outputStride = 16;
const maxPlayers = 2;
const maxXMovement = 3;

let scene = null;
let camera = null;
let renderer = null;
let controls = null;

let videoEl = null;

let net = null;
let characters = [];
let posePositions = [];
let poseRightArmPos = [];

const movementDuration = 0.5;

const threeJsMaxFps = 30;

const stages = [
    'playerMovement',
    'playerSpin',
    'playerKick'
];

let currentStage = 0;

function buildPoles() {
    let pole1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2,0.2,100,32),
        new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x858585)
        })
    );
    pole1.position.set(0,-0.04,0);
    pole1.rotation.set(0,0,1.5708);
    scene.add(pole1);

    let pole2 = pole1.clone();
    pole2.position.set(0,-0.04,-1.5);
    scene.add(pole2);
}

function buildCharacters(index) {
    let character = new Character(index, () => {
        character.addToScene(scene);
    });
    return character;
}

function getPoseXPos(pose) {
    // let currentX = 0;
    let left = pose.keypoints[5].position.x;
    let right = pose.keypoints[6].position.x;
    let currentX = (left + right) / 2;
    
    return currentX;
}

function getPoseArmPos(pose) {
    return {
        right: pose.keypoints[9].position.y,
        left: pose.keypoints[10].position.y
    };
}

function followMovement(poses) {
    poses.forEach((p,i) => {
        if (!characters[i]) {
            return;
        }
        let pos = getPoseXPos(p);
        let relPos = pos/window.innerWidth;
        characters[i].moveH((relPos * (2 * maxXMovement)) - maxXMovement, movementDuration,0);
        if (posePositions[i]) {
            let diff = posePositions[i] - relPos;
            characters[i].swing(movementDuration, diff);
        }
        posePositions[i] = relPos;
    });
}

function listenForSpin(poses) {
    poses.forEach((p,i) => {
        if (!characters[i]) {
            return;
        }
        let currentArmPos = getPoseArmPos(p);
        let relArmPos = {
            right: currentArmPos.right/window.innerHeight,
            left: currentArmPos.left/window.innerHeight
        };
        
        if (relArmPos.right < 0.5 && relArmPos.left < 0.5) {
            if (!characters[i].isSpinning()) {
                characters[i].spinChar('backwards');
            }
        }
    });
}

async function render() {
    setTimeout(() => {
        requestAnimationFrame( render );
    }, 1000 / threeJsMaxFps);
    renderer.render( scene, camera );
    controls.update();
    
    const poses = await net.estimateMultiplePoses(videoEl, {
        scoreThreshold: 0.7,
        flipHorizontal: true,
        decodingMethod: 'multi-person',
        maxDetections: maxPlayers
    });
    let faceCanvases = faces.getFaces();
    characters.forEach((c,i) => {
        if (faceCanvases[i]) {
            c.giveFace(faceCanvases[i]);
        }
        if (i >= poses.length) {
            c.hide();
        } else {
            c.show();
        }
    });

    switch (stages[currentStage]) {
        case 'playerMovement':
            followMovement(poses);
            break;
        case 'playerSpin':
            listenForSpin(poses);
            break;
        case 'playerKick':
            // TODO listen for a gesture that triggers a ball kick
            break;
        default:
            break;
    }
    
}

function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x476643);
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 5;
    camera.position.x = 0;
    camera.position.y = 1.5;
    controls.update();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let ambientLight=new THREE.AmbientLight(0xffffff, 0.5);
    let dirLight=new THREE.DirectionalLight(0xffffee, 0.7);
    dirLight.position.set(0,0.05,1);
    scene.add(ambientLight, dirLight);
    buildPoles();
    for (let index = 0; index < maxPlayers; index++) {
        characters[index] = buildCharacters(index);
    }
    render();
}

export default function main() {
    videoEl = captureVideo();
    videoEl.addEventListener('loadeddata', async () => {
        net = await posenet.load({
            architecture: netArchitecture,
            outputStride: outputStride,
        });
        createScene();
    }, false);
}