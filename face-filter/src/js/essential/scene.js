import * as THREE from 'three';
import 'regenerator-runtime/runtime';
let loadShader = require('gl-shader');

let scene = null;
let camera = null;
let renderer = null;

function render() {
    requestAnimationFrame( render );
	renderer.render( scene, camera );
}

function createScene() {
    console.log('Scene: Initialising THREE.js scene...');
    renderer = new THREE.WebGLRenderer();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    camera.position.z = 5;
    
    let ambientLight=new THREE.AmbientLight(0xffffff, 0.5);
    let dirLight=new THREE.DirectionalLight(0xffffee, 0.7);
    dirLight.position.set(0,0.05,1);
    scene.add(ambientLight, dirLight);
    render();
    console.log('Scene: THREE.js scene complete');
}

/**
 * Uses a face canvas as a texture and creates a THREE.Mesh. Appends that to the scene according to it's index.
 * @param {*} canvas HTMLCanvas with a face in it.
 * @param {*} index The index of the canvas in the detections array
 */
function drawFace(canvas, index) {
    console.log('Scene: Drawing Face to scene');
    let faceGeometry = new THREE.CircleGeometry(1,32);
    let faceTexture = new THREE.CanvasTexture(canvas);
    let faceMaterial = new THREE.MeshToonMaterial({
        map: faceTexture
    });
    let faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
    faceMesh.position.x = index * 1.5;
    scene.add(faceMesh);
}

/**
 * Creates a canvas with a 2D filter over the face.
 * @param {*} canvas A HTMLCanvas with a face image in it
 * @param {*} i The index the canvas is in the detections array.
 */
async function addFace(canvas, i) {
    let glflCanv = fx.canvas();
    let texture = glflCanv.texture(canvas);
    glflCanv.draw(texture).denoise(15).ink(0.35).update();
    drawFace(glflCanv,i);
}

export {
    createScene,
    addFace
}