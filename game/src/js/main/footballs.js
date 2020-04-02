require('../helper/physi');
import CONFIG from '../helper/config';
import * as THREE from 'three';
import {scene, camera} from './scene';

let footballGeometry = null;
let footballMaterial = null;
let loader = null;
let balls = [];

class Ball {
    constructor(position, warning) {
        this.mesh = new Physijs.SphereMesh(footballGeometry, footballMaterial,CONFIG.ballMass);
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
        console.log('Warning created ', this.mesh.position.z);
        
        this.warningInterval = setInterval(() => {
            let coords = getWindowCoords(this.mesh);
            console.log('Warning updated ', this.mesh.position.z, coords.x);
            if (this.mesh.position.z >= camera.position.z * 1.5) {
                this.warning.style.right = coords.x + 'px';
            }
            // this.warning.style.top = coords.y + 'px';
            
            if (this.mesh.position.z <= camera.position.z - 10) {
                console.log('Warning removed ', this.mesh.position.z);
                this.removeWarning();
            }
        },1);

        setTimeout(() => {
            if (this.warning) {
                console.log('Warning decayed ', this.mesh.position.z);
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
    footballMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: loader.load('/models/football/football.jpeg')
    }),CONFIG.ballFriction,CONFIG.ballBounce);
}

function clearAll() {
    balls.forEach(b => {
        b.remove();
    });
    balls = [];
}

export {
    init,
    Ball,
    clearAll
}