import * as THREE from 'three';
require('./physi');

let scene = null;
let camera = null;
let renderer = null;
let loader = null;

function animate() {
    scene.simulate();
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
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
    }),0.4,8);
    let mesh = new Physijs.SphereMesh(geometry, material,0.3);
    mesh.setDamping(0.01,0.01);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    scene.add(mesh);
    mesh.setLinearVelocity(new THREE.Vector3(0,0,-4));
}

function setupFloor() {
    let table = new Physijs.BoxMesh(
        new THREE.CubeGeometry(50, 1, 50),
        Physijs.createMaterial(new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xdbd7bd)
        }),0.9,0.2),
        0, // mass
        { restitution: .2, friction: .8 }
    );
    table.position.y = -5;
    table.receiveShadow = true;
    scene.add( table );
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function throwBalls() {
    setInterval(() => {
        setupObject({x:getRandomInt(-4,4), y:getRandomInt(-4,4)});
    },700);
}

function init() {
    Physijs.scripts.worker = '../../../physi/physijs_worker.js';
	Physijs.scripts.ammo = '../../../physi/ammo.js';
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3( 0, -29.43, 0 ));
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    loader = new THREE.TextureLoader();
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMapEnabled = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    camera.position.z = 5;
    camera.position.y = -2;

    setupLight();
    setupFloor();
    animate();
    throwBalls();
}

export {
    init
}