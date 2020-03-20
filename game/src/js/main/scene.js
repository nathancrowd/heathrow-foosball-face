import * as THREE from 'three';
import {GLTFLoader} from '../helper/gltfLoader.js';
import {OrbitControls} from '../helper/OrbitControls.js';
import Character from './character.js';
import CONFIG from '../helper/config.js';
import getRandomInt from '../helper/randomInt';
// import * as Posenet from './posenet';
require('../helper/physi');
import {imageCapture} from './media';
import Server from "./server";
import Haptics from "./haptics";

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let renderLoop = null;
let gltfLoader = null;
let characters = [];
let activePlayers = [];
let characterMidPoint = 0;
let Posenet = null;
let renderTarget = null;
let scienceServer = null;
let haptics = null;
let paused = true;

/**
 *
 * @param {*} x A pixel coordinate
 *
 * returns the position relative to the window's mid-point.
 * Where: 0 is the middle, -1 is left, and 1 is right
 */
function relativeXToWindowMiddle(x) {
    let relX = x / window.innerWidth;
    let diff = relX - 0.5;

    return diff;
}

function round_to_precision(x, precision) {
    var y = +x + (precision === undefined ? 0.5 : precision / 2);
    return y - (y % (precision === undefined ? 1 : +precision));
}

/**
 * Gets the midpoint of the character's group.
 */

const groupMidPointMap = {
    '111': 0,
    '110': -.5,
    '101': 0,
    '011': .5,
    '010': 0,
    '001': 1,
    '100': -1
}

function getGroupMidPoint() {

    const lookup = characters.map(c => {
        if (c.mesh.parent) return '1';
        return '0';
    }).join('');

    return groupMidPointMap[lookup];
}


function getPosesMidPoint(poses) {
    let poseXs = [];
    poses.forEach(p => {
        poseXs.push(getPoseXPos(p));
    });

    let totalX = 0;
    poseXs.forEach(p => {
        totalX += p;
    });
    let midPoint = totalX / poses.length;

    return midPoint;
}

function getPoseXPos(pose) {
    // let currentX = 0;
    // let left = pose.keypoints[5].position.x;
    // let right = pose.keypoints[6].position.x;
    // currentX = (left + right) / 2;

    return pose.keypoints[0].position.x;
    // return currentX;
}

function posenetReturn(e) {
    let poses = null;
    if (e.data.poses) {
        poses = e.data.poses;
    } else {
        return;
    }

    activePlayers.forEach(p => {
        p.moveH((poses * (2 * CONFIG.maxXMovement)) + (CONFIG.characterSpacing * characterMidPoint), CONFIG.characterMovementSpeed, CONFIG.characterMovementDelay);
        // p.swing(getRandomInt(0,10)/10,getRandomInt(7,10)/10);
    });
}

function mobileReturn(e) {
    let relX = relativeXToWindowMiddle(e.touches[0].clientX);

    activePlayers.forEach(p => {
        p.moveH((relX * (2 * CONFIG.maxXMovement)) + (CONFIG.characterSpacing * characterMidPoint), 0, 0);
        // p.swing(getRandomInt(0,10)/10,getRandomInt(7,10)/10);
    });
}

function animate() {
    if (paused) {
        return;
    }
    scene.simulate();
    setTimeout(function () {
        renderLoop = requestAnimationFrame(animate);
    }, 1000 / CONFIG.maxFps);
    renderer.render(scene, camera);
    if (CONFIG.enableControls) {
        controls.update();
    }
    if (CONFIG.mobile) {

    } else {
        imageCapture.grabFrame().then(b => {
            Posenet.postMessage({
                action: 'getPoses',
                video: b
            }, [b]);
        }).catch(e => {
        });
    }
    // Posenet.getPoses().then((poses) => {
    //     if (!poses.length) {
    //         return;
    //     }

    //     let xPos = Posenet.getGroupMidPoint(poses);
    //     console.log(xPos);

    //     userPosition.style.left = `${xPos}px`;
    //     let relX = relativeXToWindowMiddle(xPos);
    //     if (!relX) {
    //         return;
    //     }
    //     let move = round_to_precision(relX, 0.01);
    //     activePlayers.forEach(p => {
    //         p.moveH((move * (2 * CONFIG.maxXMovement)) + (CONFIG.characterSpacing * characterMidPoint), 0.2,0);
    //         // p.swing(getRandomInt(0,10)/10,getRandomInt(7,10)/10);
    //     });
    // }).catch(error => { console.error(error) });
    activePlayers.forEach(p => {
        p.mesh.__dirtyPosition = true;
        p.mesh.__dirtyRotation = true;
    });
    renderer.shadowMap.needsUpdate = true;
}

function pause() {
    cancelAnimationFrame(renderLoop);
    renderLoop = null;
    paused = true;
}

function reset() {
    renderer.domElement.style.display = 'none';
    clearCharacters();
    scene.dispose();
    pause();
    characters = [];
    activePlayers = [];
    buildCharacters();
    haptics.listenKicks(characters);
    scienceServer.saveResults();

}

function setupLight() {
    let am_light = new THREE.AmbientLight(0x888888);
    scene.add(am_light);

    // directional light
    let dir_light = new THREE.DirectionalLight(0xFFFFFF);
    dir_light.position.set(20, 30, -5);
    dir_light.target.position.copy(scene.position);
    dir_light.castShadow = true;
    dir_light.shadow.camera.left = -30;
    dir_light.shadow.camera.top = -30;
    dir_light.shadow.camera.right = 30;
    dir_light.shadow.camera.bottom = 30;
    dir_light.shadow.camera.near = 20;
    dir_light.shadow.camera.far = 200;
    dir_light.shadow.bias = -.001
    dir_light.shadow.mapSize.width = dir_light.shadow.mapSize.height = 2048;
    scene.add(dir_light);
}

function buildTable() {
    gltfLoader.load(
        'models/table/scene.gltf',
        (table) => {
            table.scene.rotation.y = 1.5708;
            table.scene.position.y = -34;
            let box = new THREE.Box3().setFromObject(table.scene);
            let boundingMat = Physijs.createMaterial(new THREE.MeshLambertMaterial(), CONFIG.wallFriction, CONFIG.wallBounce);
            // Floor
            let tableFloor = new Physijs.BoxMesh(
                new THREE.PlaneGeometry(Math.abs(box.max.x - box.min.x), Math.abs(box.max.z - box.min.z), 32),
                boundingMat,
                0
            );
            tableFloor.rotation.x = 1.5708;
            tableFloor.position.y = -10;


            // Walls
            let wall = null;
            let wallGeomLong = new THREE.PlaneGeometry(Math.abs(box.max.z - box.min.z), 20);
            let wallGeomShort = new THREE.PlaneGeometry(Math.abs(box.max.x - box.min.x), 20);
            // left
            wall = new Physijs.BoxMesh(wallGeomLong, boundingMat, 0);
            wall.rotation.y = 1.5708;
            wall.position.x = -39;
            wall.visible = false;
            scene.add(wall);
            // right
            wall = new Physijs.BoxMesh(wallGeomLong, boundingMat, 0);
            wall.rotation.y = 1.5708;
            wall.position.x = 24;
            wall.visible = false;
            scene.add(wall);
            // back
            wall = new Physijs.BoxMesh(wallGeomShort, boundingMat);
            wall.position.z = -54;
            wall.visible = false;
            scene.add(wall);
            // goal
            let goalGeom = new THREE.PlaneGeometry(Math.abs(box.max.x - box.min.x) / 4, 20);
            wall = new Physijs.BoxMesh(goalGeom, boundingMat);
            wall.position.z = -54;
            wall.position.x = -8;
            wall.visible = false;
            scene.add(wall);
            // front
            wall = new Physijs.BoxMesh(wallGeomShort, boundingMat);
            wall.position.z = 53;
            wall.visible = false;
            scene.add(wall);

            scene.add(tableFloor);
            addShadow(table.scene);
            scene.add(table.scene);
        }
    );
}

function addShadow(o) {
    if (!o.children) {
        return;
    }
    o.children.forEach(c => {
        c.receiveShadow = true;
        addShadow(c);
    });
}

function buildPoles() {
    let poleGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(0.7, 0.7, 80, 32));

    let poleMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({
        color: 0x000000,
        // specular: 0xffffff,
        // shininess: 50
    }), CONFIG.wallFriction, CONFIG.wallBounce);
    CONFIG.poles.forEach(p => {
        // let g = poleGeometry.clone();
        let pole = new Physijs.CylinderMesh(poleGeometry, poleMaterial, 0);
        pole.castShadow = true;
        pole.receiveShadow = false;
        pole.position.set(p.x, p.y, p.z);
        pole.rotation.set(0, 0, 1.5708);
        scene.add(pole);
    });
}

function clearCharacters() {
    characters.forEach(c => {
        scene.remove(c.mesh);
        c.kill(); // explicitly removing listeners
    });
}

function buildCharacters() {
    CONFIG.characters.forEach((c, i) => {
        let character = new Character(i, () => {
            // character.addToScene(scene);
            // character.hide();
        }, c);
        characters.push(character);
    });
}

function init() {
    console.clear(); //removes many not useful repetitive console dev warnings.

    if (CONFIG.mobile) {
        document.addEventListener('touchmove', mobileReturn, false);
    } else {
        Posenet = new Worker('/dist/js/posenet.js');
        Posenet.postMessage({
            action: 'init'
        });
        Posenet.addEventListener('message', posenetReturn, false);
    }
    Physijs.scripts.worker = '../../physics/physijs_worker.js';
    Physijs.scripts.ammo = '../../physics/ammo.js';
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -29.43, 0));
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    gltfLoader = new GLTFLoader();
    renderer.shadowMap.enabled = CONFIG.drawShadows;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;

    renderer.setClearColor(0x000000, 0.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    if (CONFIG.enableControls) {
        controls = new OrbitControls(camera, renderer.domElement);
    }

    camera.position.x = CONFIG.cameraPosition.x;
    camera.position.y = CONFIG.cameraPosition.y;
    camera.position.z = CONFIG.cameraPosition.z;

    if (CONFIG.enableControls) {
        controls.update();
    }

    scienceServer = new Server();
    haptics = new Haptics();


    setupLight();
    buildTable();
    buildPoles();
    buildCharacters();
    haptics.listenKicks(characters);
}

function start() {
    paused = false;
    characterMidPoint = getGroupMidPoint();
    renderer.domElement.style.display = 'block';
    animate();
}

export {
    init,
    start,
    pause,
    characters,
    activePlayers,
    scene,
    reset,
    camera
}