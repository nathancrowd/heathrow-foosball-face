import * as THREE from 'three';
import {GLTFLoader} from './gltfLoader.js';
import {OrbitControls} from './OrbitControls';
require('./physi');

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let loader = null; // Texture Loader
let gltfLoader = null;

function animate() {
    scene.simulate();
	requestAnimationFrame( animate );
    renderer.render( scene, camera );
    controls.update();
}

function setupLight() {
    let am_light = new THREE.AmbientLight( 0x444444 );
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

function setupObject(position) {
    let geometry = new THREE.SphereGeometry(1,32,32);
    let material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: loader.load('./football.jpeg')
    }),0.4,1);
    let mesh = new Physijs.SphereMesh(geometry, material,0.1);
    mesh.setDamping(0.01,0.01);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    let name = Date.now();
    mesh.name = name;
    scene.add(mesh);
    mesh.setLinearVelocity(new THREE.Vector3(0,0,-4));
    setTimeout(() => {
        let obj = scene.getObjectByName(name);
        scene.remove(obj);
    }, 20000);
}

function setupFloor() {
    gltfLoader.load(
        'table/scene.gltf',
        (table) => {
            table.scene.rotation.y = 1.5708;
            table.scene.position.y = -34;
            let box = new THREE.Box3().setFromObject( table.scene );
            let boundingMat = Physijs.createMaterial(new THREE.MeshLambertMaterial(), 0.1,0.3);
            // Floor
            let tableFloor = new Physijs.BoxMesh(
                new THREE.PlaneGeometry(Math.abs(box.max.y - box.min.y), Math.abs(box.max.x - box.min.x), 32),
                boundingMat,
                0
            );
            tableFloor.rotation.x = 1.5708;
            tableFloor.position.y = -10;

            // Walls
            let wall = null;
            let wallGeomLong = new THREE.PlaneGeometry(Math.abs(box.max.x - box.min.x), 20);
            let wallGeomShort = new THREE.PlaneGeometry(Math.abs(box.max.y - box.min.y), 20);
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

            scene.add(tableFloor);
            scene.add( table.scene );
        }
    )
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function throwBalls() {
    setInterval(() => {
        setupObject({x:getRandomInt(-8,8), y:getRandomInt(-4,4)});
    },100);
}

function init() {
    Physijs.scripts.worker = '../../../physi/physijs_worker.js';
	Physijs.scripts.ammo = '../../../physi/ammo.js';
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3( 0, -29.43, 0 ));
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    loader = new THREE.TextureLoader();
    gltfLoader = new GLTFLoader();
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMapEnabled = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    controls = new OrbitControls( camera, renderer.domElement );

    camera.position.z = 5;
    camera.position.y = -2;

    controls.update();

    setupLight();
    setupFloor();
    animate();
    throwBalls();
}

export {
    init
}