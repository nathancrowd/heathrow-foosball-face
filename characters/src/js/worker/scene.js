import * as THREE from 'three';
import config from '../essential/config';
import {OrbitControls} from '../essential/OrbitControls';
import * as faces from '../essential/faces';
import Character from '../essential/character';
// import * as comlink from 'comlink';

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let characters = [];
let size = {
    width: null,
    height: null
};
let poses = null;
let posePositions = [];

let currentStage = 0;

let getPoseXPos = (pose) => {
    // let currentX = 0;
    let left = pose.keypoints[5].position.x;
    let right = pose.keypoints[6].position.x;
    let currentX = (left + right) / 2;
    
    return currentX;
}

let getPoseArmPos = (pose) => {
    return {
        right: pose.keypoints[9].position.y,
        left: pose.keypoints[10].position.y
    };
}

let followMovement = (poses) => {
    poses.forEach((p,i) => {
        if (!characters[i]) {
            return;
        }
        let pos = getPoseXPos(p);
        let relPos = pos/size.width;
        characters[i].moveH((relPos * (2 * config.maxXMovement)) - config.maxXMovement, config.movementDuration,0);
        if (posePositions[i]) {
            let diff = posePositions[i] - relPos;
            characters[i].swing(config.movementDuration, diff);
        }
        posePositions[i] = relPos;
    });
}

let listenForSpin = (poses) => {
    poses.forEach((p,i) => {
        if (!characters[i]) {
            return;
        }
        let currentArmPos = getPoseArmPos(p);
        let relArmPos = {
            right: currentArmPos.right/size.height,
            left: currentArmPos.left/size.height
        };
        
        if (relArmPos.right < 0.5 && relArmPos.left < 0.5) {
            if (!characters[i].isSpinning()) {
                characters[i].spinChar('backwards');
            }
        }
    });
}

let buildCharacters = (index) => {
    let character = new Character(index, () => {
        character.addToScene(scene);
    });
    return character;
}
let render = () => {
    setTimeout(() => {
        requestAnimationFrame( render );
    }, 1000 / config.threeJsMaxFps);
    renderer.render( scene, camera );
    // controls.update();
    if (poses) {
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
        switch (config.stages[currentStage]) {
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
    
}

let buildPoles = () => {
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

let init = (canvas) => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x476643);
    camera = new THREE.PerspectiveCamera( 75, size.width / size.height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas
    });
    // controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 5;
    camera.position.x = 0;
    camera.position.y = 1.5;
    // controls.update();
    renderer.setSize(size.width, size.height, false);
    // document.body.appendChild(renderer.domElement);

    let ambientLight=new THREE.AmbientLight(0xffffff, 0.5);
    let dirLight=new THREE.DirectionalLight(0xffffee, 0.7);
    dirLight.position.set(0,0.05,1);
    scene.add(ambientLight, dirLight);
    buildPoles();
    for (let index = 0; index < config.maxPlayers; index++) {
        characters[index] = buildCharacters(index);
    }
    render();
}
self.addEventListener('message', function(message) {
    switch (message.data.action) {
        case 'init':
            size.width = message.data.width;
            size.height = message.data.height;
            let canvas = message.data.canvas;
            init(canvas);
            break;
        case 'send_poses':
            poses = message.data.poses;
            break;
        default:
            break;
    }
    
}, false);