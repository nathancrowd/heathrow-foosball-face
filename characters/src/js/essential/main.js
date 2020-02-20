import 'regenerator-runtime/runtime';
import * as THREE from 'three';
import Character from './character';
import * as posenet from '@tensorflow-models/posenet';
import captureVideo from './video-capture';
import {OrbitControls} from './OrbitControls';

// const netArchitecture = 'MobileNetV1'; // Light but inaccurate
const netArchitecture = 'ResNet50'; // Heavy but more accurate

const maxPlayers = 1;
const maxXMovement = 3;

let scene = null;
let camera = null;
let renderer = null;
let controls = null;

let videoEl = null;

let net = null;
let characters = [];
let posePositions = [];

const movementDuration = 0.5;

const stages = [
    'playerMovement',
    'playerSpin',
    'playerKick'
];

let currentStage = 0;

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

async function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
    // controls.update();
    
    const poses = await net.estimateMultiplePoses(videoEl, {
        segmentationThreshold: 0.5,
        flipHorizontal: true,
        decodingMethod: 'multi-person',
        maxDetections: maxPlayers
    });

    characters.forEach((c,i) => {
        
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
            // TODO listen for a gesture that triggers a spin
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
    scene.background = new THREE.Color(0xf0f0f0);
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    // controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 5;
    camera.position.x = -0.5;
    camera.position.y = 1.5;
    // controls.update();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let ambientLight=new THREE.AmbientLight(0xffffff, 0.5);
    let dirLight=new THREE.DirectionalLight(0xffffee, 0.7);
    dirLight.position.set(0,0.05,1);
    scene.add(ambientLight, dirLight);
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
            outputStride: 16,
        });
        createScene();
    }, false);
}