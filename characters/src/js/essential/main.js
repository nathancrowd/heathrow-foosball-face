import 'regenerator-runtime/runtime';
import * as THREE from 'three';
import {OBJLoader} from './OBJLoader';
import {gsap} from 'gsap';

let scene = null;
let camera = null;
let renderer = null;

function moveH(char, h, duration, delay) {
    gsap.to(char.position, {
        duration: duration,
        delay: delay,
        x: h
    });
}

function spinChar(char, direction) {
    let angle = null;
    switch (direction) {
        case 'forwards':
            angle = 6.28319
            break;
        case 'backwards':
            angle = -6.28319
            break;
        default:
            break;
    }
    let tl = new gsap.timeline();
    tl.to(char.rotation, {
        duration: 1,
        x: angle
    }).to(char.rotation, {
        duration: 0,
        x: 0
    })

    tl.play();
}

function buildCharacters() {
    const loader = new OBJLoader();
    let character = null;

    loader.load('../../GamePeice.obj', o => {
        let geo = new THREE.Geometry().fromBufferGeometry(o.children[0].geometry);
        geo.translate( 0, -9, 0 );
        let mat = new THREE.MeshLambertMaterial({
            color: 0xedca91,
        });
        character = new THREE.Mesh(geo, mat);
        character.scale.multiplyScalar(0.2);
        character.position.set(0,0,0);
        scene.add(character);
        moveH(character, 1, 1, 0);
        moveH(character, -1, 1, 1.5);
        moveH(character, 0, 0.5, 2.5);
        setTimeout(() => {
            spinChar(character, 'backwards');
        },3000)
    });

}

function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
}

function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();

    camera.position.z = 5;

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    let ambientLight=new THREE.AmbientLight(0xffffff, 0.5);
    let dirLight=new THREE.DirectionalLight(0xffffee, 0.7);
    dirLight.position.set(0,0.05,1);
    scene.add(ambientLight, dirLight);

    render();
}

export default function main() {
    createScene();
    buildCharacters();
}