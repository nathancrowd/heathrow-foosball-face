require('../helper/physi');
import CONFIG from '../helper/config';
import * as THREE from 'three';
import {scene} from './scene';

let footballGeometry = null;
let footballMaterial = null;
let loader = null;

function init() {
    loader = new THREE.TextureLoader();
    footballGeometry = new THREE.SphereGeometry(1,32,32);
    footballMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: loader.load('/models/football/football.jpeg')
    }),CONFIG.ballFriction,CONFIG.ballBounce);
}

function createBall(position) {
    let mesh = new Physijs.SphereMesh(footballGeometry, footballMaterial,CONFIG.ballMass);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = 50;
    let name = Date.now();
    mesh.name = name;
    scene.add(mesh);
    mesh.setLinearVelocity(new THREE.Vector3(0,0,-CONFIG.ballSpeed));
    mesh.addEventListener('collision', (obj, relV, relR, cN) => {
        // mesh.setLinearVelocity(new THREE.Vector3(0,0,CONFIG.ballSpeed));
    })
    setTimeout(() => {
        let obj = scene.getObjectByName(name);
        scene.remove(obj);
    }, CONFIG.ballDecay);
}

export {
    init,
    createBall
}