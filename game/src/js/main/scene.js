import * as THREE from 'three';
import {GLTFLoader} from '../helper/gltfLoader.js';
import {OrbitControls} from '../helper/OrbitControls.js';
import Character from './character.js';
import CONFIG from '../helper/config.js';
import getRandomInt from '../helper/randomInt';
import * as Posenet from './posenet';
require('../helper/physi');

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let renderLoop = null;
let gltfLoader = null;
let characters = [];
let activePlayers = [];

function relativeXToWindowMiddle(x) {
    let relX = x / window.innerWidth;

    let diff = relX - 0.5;
    
    return diff;
}

function animate() {
    scene.simulate();
	renderLoop = requestAnimationFrame( animate );
    renderer.render( scene, camera );
    if (CONFIG.enableControls) {
        controls.update();
    }
    Posenet.getPoses().then((poses) => {
        if (!poses.length) {
            return;
        }
        let xPos = Posenet.getGroupMidPoint(poses);
        userPosition.style.left = `${(xPos/window.innerWidth) * 100}vw`;
        let relX = relativeXToWindowMiddle(xPos);
        if (!relX) {
            return;
        }
        activePlayers.forEach(p => {
            p.moveH((relX * (2 * CONFIG.maxXMovement)), 0,0);
            // p.swing(getRandomInt(0,10)/10,getRandomInt(7,10)/10);
        });
    }).catch(error => { console.error(error) });
    activePlayers.forEach(p => {
        p.mesh.__dirtyPosition = true;
        p.mesh.__dirtyRotation = true;
    });
}

function pause() {
    cancelAnimationFrame(renderLoop);
    renderLoop = null;
}

function reset() {
    renderer.domElement.style.display = 'none';
    clearCharacters();
    scene.dispose();
    pause();
    characters = [];
    activePlayers = [];
    buildCharacters();
}

function setupLight() {
    let am_light = new THREE.AmbientLight( 0x888888 );
		scene.add( am_light );

		// directional light
		let dir_light = new THREE.DirectionalLight( 0xFFFFFF );
		dir_light.position.set( 20, 30, -5 );
		dir_light.target.position.copy( scene.position );
		dir_light.castShadow = true;
		dir_light.shadowCameraLeft = -30;
		dir_light.shadowCameraTop = -30;
		dir_light.shadowCameraRight = 30;
		dir_light.shadowCameraBottom = 30;
		dir_light.shadowCameraNear = 20;
		dir_light.shadowCameraFar = 200;
		dir_light.shadowBias = -.001
		dir_light.shadowMapWidth = dir_light.shadowMapHeight = 2048;
		dir_light.shadowDarkness = .5;
		scene.add( dir_light );
}

function buildTable() {
    gltfLoader.load(
        'models/table/scene.gltf',
        (table) => {
            table.scene.rotation.y = 1.5708;
            table.scene.position.y = -34;
            let box = new THREE.Box3().setFromObject( table.scene );
            let boundingMat = Physijs.createMaterial(new THREE.MeshLambertMaterial(), CONFIG.wallFriction,CONFIG.wallBounce);
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
            wall = new Physijs.BoxMesh( wallGeomLong, boundingMat, 0);
            wall.rotation.y = 1.5708;
            wall.position.x = -39;
            wall.visible = false;
            scene.add(wall);
            // right
            wall = new Physijs.BoxMesh( wallGeomLong, boundingMat, 0);
            wall.rotation.y = 1.5708;
            wall.position.x = 24;
            wall.visible = false;
            scene.add(wall);
            // back
            wall = new Physijs.BoxMesh( wallGeomShort, boundingMat);
            wall.position.z = -54;
            wall.visible = false;
            scene.add(wall);
            // goal
            let goalGeom = new THREE.PlaneGeometry(Math.abs(box.max.x - box.min.x) / 4, 20);
            wall = new Physijs.BoxMesh( goalGeom, boundingMat);
            wall.position.z = -54;
            wall.position.x = -8;
            wall.visible = false;
            scene.add(wall);
            // front
            wall = new Physijs.BoxMesh( wallGeomShort, boundingMat);
            wall.position.z = 53;
            wall.visible = false;
            scene.add(wall);

            scene.add(tableFloor);
            addShadow(table.scene);
            scene.add( table.scene );
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
    let poleGeometry = new THREE.CylinderGeometry(0.7,0.7,80,32);
    let poleMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({
        color: new THREE.Color(0x858585)
    }),CONFIG.wallFriction,CONFIG.wallBounce);
    CONFIG.poles.forEach(p => {
        let pole = new Physijs.CylinderMesh(poleGeometry,poleMaterial,0);
        pole.position.set(p.x,p.y,p.z);
        pole.rotation.set(0, 0, 1.5708);
        scene.add(pole);
    });
}

function clearCharacters() {
    characters.forEach(c => {
        scene.remove(c.mesh);
    });
}

function buildCharacters() {
    CONFIG.characters.forEach((c,i) => {
        let character = new Character(i,() => {
            character.addToScene(scene);
            character.hide();
        },c);
        characters.push(character);
    });
}

function init() {
    Physijs.scripts.worker = '../../physics/physijs_worker.js';
	Physijs.scripts.ammo = '../../physics/ammo.js';
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3( 0, -29.43, 0 ));
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    gltfLoader = new GLTFLoader();

    renderer.shadowMapEnabled = true;
    renderer.setClearColor(0x000000, 0.0);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    if (CONFIG.enableControls) {
        controls = new OrbitControls( camera, renderer.domElement );
    }
    
    camera.position.x = CONFIG.cameraPosition.x;
    camera.position.y = CONFIG.cameraPosition.y;
    camera.position.z = CONFIG.cameraPosition.z;

    if (CONFIG.enableControls) {
        controls.update();
    }

    setupLight();
    buildTable();
    buildPoles();
    buildCharacters();
}

function start() {
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
    reset
}