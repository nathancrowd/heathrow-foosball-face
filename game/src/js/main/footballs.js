require('../helper/physi');
import CONFIG from '../helper/config';
import * as THREE from 'three';
import { CanvasTexture, MeshBasicMaterial, SpriteMaterial, Plane } from 'three';
import getRandomInt from '../helper/randomInt';
import {scene, camera} from './scene';

let footballGeometry = null;
let innerGeometry = null;
let footballMaterial = null;
let invisibleMaterial = null;
let loader = null;
let balls = [];
let faces = [];

class Ball {
    constructor(position, warning) {
        this.mesh = new Physijs.SphereMesh(footballGeometry, footballMaterial,CONFIG.ballMass);
        if (getRandomInt(0,10) < 2) {
            let ref = Date.now();
            let plainMaterial = new THREE.MeshLambertMaterial({
                transparent: true,
                opacity: 0,
                stencilWrite: true,
                stencilRef: ref,
                stencilZPass: THREE.ReplaceStencilOp,
                renderOrder: 1,
            });
            let innerFootball = new THREE.Mesh(footballGeometry, plainMaterial);
            let faceBall = new THREE.Sprite(new SpriteMaterial({
                map: new CanvasTexture(faces[getRandomInt(0, faces.length - 1)][0]),
                stencilWrite: true,
                stencilRef: ref,
                stencilFunc: THREE.EqualStencilFunc,
                depthTest: false,
                renderOrder: 1
            }));
            faceBall.scale.set(2, 2, 1.0);
            faceBall.position.set(0, 0, 0);
            this.mesh.add(innerFootball);
            this.mesh.add(faceBall);
        }
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = 50;
        let name = Date.now();
        this.mesh.name = name;
        scene.add(this.mesh);
        if (warning) {
            this.createWarning();
        }
        balls.push(this);
        this.throw();
    }

    throw() {
        this.mesh.setLinearVelocity(new THREE.Vector3(0,0,-CONFIG.ballSpeed));
    }

    createWarning() {
        this.warning = document.createElement('figure');
        this.warning.classList.add('ball-warning');
        this.warning.innerHTML = `<svg>
        <defs><clipPath id="a9c81aa8-4ba8-41e2-a150-b45d20ec3241"><circle cx="89.5" cy="89.5" r="85" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="9"/></clipPath></defs>
        <use href="#football"></use>
        </svg>`;
        document.body.appendChild(this.warning);
        
        this.warningInterval = setInterval(() => {
            let coords = getWindowCoords(this.mesh);
            if (this.mesh.position.z >= camera.position.z * 1.5) {
                this.warning.style.right = coords.x + 'px';
            }
            // this.warning.style.top = coords.y + 'px';
            
            if (this.mesh.position.z <= camera.position.z - 10) {
                this.removeWarning();
            }
        },1);

        setTimeout(() => {
            if (this.warning) {
                this.removeWarning();
            }
        }, CONFIG.ballWarningDecay);
    }
    removeWarning() {        
        window.clearInterval(this.warningInterval);
        document.body.removeChild(this.warning);
        this.warning = null;
    }

    remove() {
        if (this.warning) {
            this.removeWarning();
        }
        scene.remove(this.mesh);
    }
}

function getWindowCoords(object) {
    let width = window.innerWidth, height = window.innerHeight;
    let widthHalf = width / 2;
    let heightHalf = height / 2;

    let pos = object.position.clone();
    pos = pos.project(camera);
    
    
    pos.x = ( pos.x * widthHalf ) + widthHalf;
    pos.y = ( pos.y * heightHalf ) + heightHalf;
    
    return pos;
}

function init() {
    loader = new THREE.TextureLoader();
    footballGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(1,32,32));
    innerGeometry = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(0.99,32,32));
    footballMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: loader.load('/models/football/football.jpeg'),
        renderOrder: 0
    }),CONFIG.ballFriction,CONFIG.ballBounce);
    invisibleMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
    }),CONFIG.ballFriction,CONFIG.ballBounce);
}

function clearAll() {
    balls.forEach(b => {
        b.remove();
    });
    balls = [];
}

function setFaces(f) {
    faces = f;
}

export {
    init,
    Ball,
    clearAll,
    setFaces
}