import * as THREE from 'three';
import {OBJLoader} from '../helper/OBJLoader.js';
import {MTLLoader} from '../helper/MTLLoader.js';
import {gsap} from 'gsap';
import { CanvasTexture } from 'three';
import CONFIG from '../helper/config.js';
import fx from '../helper/glfx';
import * as score from './score';
import getRandomInt from '../helper/randomInt';
require('../helper/physi');

const errors = {
    nomesh: 'ERROR: Character Mesh has not been created. Try calling load()',
    noface: 'ERROR: Character Face has not been created. Try calling load()',
    nofacemap: 'WARNING: Character Face has no map.'
};

const blankVector = new THREE.Vector3(0,0,0);
const fullVector =  new THREE.Vector3(1,1,1);

export default class Character {
    constructor(index = 0,callback = null,position = {}) {
        this.mesh = null;
        this.geometry = null;
        this.material = null;
        this.face = null;
        this.position = position;
        if (callback) {
            this.createCallback = callback;
        }
        this.pickTeam();
        this.index = index;
        this.spinPlaying = false;
        this.load();
    }

    load() {
        const loader = new OBJLoader();
        loader.load('/models/character/foosball_player_test_v2.obj', o => {
            // this.geometry = new THREE.Geometry().fromBufferGeometry(o.children[0].geometry);
            o.children[0].castShadow = true;
            o.children[0].receiveShadow = true;
            o.children[0].geometry.translate( 0, -9, 0 );
            o.children[0].geometry.computeBoundingBox();
            let size = new THREE.Vector3();
            o.children[0].geometry.boundingBox.getSize(size)
            this.geometry = new THREE.BoxGeometry(size.x,size.y * 1.2,size.z);
            // this.material = Physijs.createMaterial(o.children[0].material, CONFIG.wallFriction,CONFIG.wallBounce);
            this.material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
                transparent: true,
                opacity: 0
            }), CONFIG.wallFriction,CONFIG.wallBounce);
            this.mesh = new Physijs.BoxMesh(this.geometry, this.material,0);
            this.mesh.add(o);
            this.mesh.scale.multiplyScalar(0.7);
            this.mesh.position.set(this.position.x,this.position.y,this.position.z);
            this.basePosition = this.mesh.position;
            let faceGeometry = new THREE.CircleGeometry(2,32);
            let faceMat = new THREE.MeshPhongMaterial({
            });
            this.face = new THREE.Mesh(faceGeometry, faceMat);
            this.face.position.set(0,3.5,1.25);
            o.add(this.face);
            this.mesh.addEventListener('collision', (co,v,r,n) => {
                co.setLinearVelocity(new THREE.Vector3(0,0,0));
                this.kick();
                score.increment();
                co.setLinearVelocity(new THREE.Vector3(0,15,CONFIG.ballSpeed));
            });
            this.createCallback();
        });
    }

    addToScene(scene) {
        if (!this.mesh) {
            console.error(errors.nomesh);
            return;
        }
        scene.add(this.mesh);
    }

    swing(duration, intensity) {
        if (!this.mesh) {
            console.error(errors.nomesh);
            return;
        }
        let tl = new gsap.timeline();
        tl.to(this.mesh.rotation, {
            duration: duration / 5,
            x: -intensity
        }).to(this.mesh.rotation, {
            duration: duration / 5,
            x: intensity * 0.75
        }).to(this.mesh.rotation, {
            duration: duration / 5,
            x: -intensity * 0.5
        }).to(this.mesh.rotation, {
            duration: duration / 5,
            x: intensity * 0.25
        }).to(this.mesh.rotation, {
            duration: duration / 5,
            x: intensity * 0
        });
        tl.play();
        this.mesh.__dirtyRotation = true;
    }

    kick() {
        if (!this.mesh) {
            console.error(errors.nomesh);
            return;
        }
        let tl = new gsap.timeline();
        tl.to(this.mesh.rotation, {
            duration: 0.1,
            x: 0.0523599
        }).to(this.mesh.rotation, {
            duration: 0.3,
            x: -0.785398
        }).to(this.mesh.rotation, {
            duration: 0.2,
            x: 0
        });
        tl.play();
        this.mesh.__dirtyRotation = true;
    }

    moveH(h, duration, delay) {
        if (!this.mesh) {
            console.error(errors.nomesh);
            return;
        }
        if (this.moving) {
            return;
        }
        this.moving = true;
        
        let moveTo = this.position.x + h;
        
        gsap.to(this.mesh.position, {
            duration: duration,
            delay: delay,
            x: moveTo,
            ease: 'expo.inOut',
            onComplete: () => {
                this.moving  = false;
            }
        });
    }

    isSpinning() {
        return this.spinPlaying;
    }
    
    spinChar(direction) {
        if (!this.mesh) {
            console.error(errors.nomesh);
            return;
        }
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
        let tl = new gsap.timeline({
            onComplete: () => {
                this.spinPlaying = false;
            }
        });
        tl.to(this.mesh.rotation, {
            duration: 0.5,
            x: angle
        }).to(this.mesh.rotation, {
            duration: 0,
            x: 0
        }).to(this.mesh.rotation, {
            duration: 0.5,
            x: angle
        }).to(this.mesh.rotation, {
            duration: 0,
            x: 0
        }).to(this.mesh.rotation, {
            duration: 0.5,
            x: angle
        }).to(this.mesh.rotation, {
            duration: 0,
            x: 0
        });
    
        tl.play();
        this.spinPlaying = true;
    }

    hide() {
        if (!this.mesh){
            console.error(errors.nomesh);
            return;
        }
        this.mesh.setAngularFactor(blankVector);
        this.mesh.setLinearFactor(blankVector);
        this.mesh.visible = false;
    }

    show() {
        if (!this.mesh){
            console.error(errors.nomesh);
            return;
        }
        this.mesh.setAngularFactor(fullVector);
        this.mesh.setLinearFactor(fullVector);
        this.mesh.visible = true;
    }

    delete(scene) {
        scene.remove(this.mesh);
    }

    giveFace(canvas) {
        let glflCanv = fx.canvas();
        let texture = glflCanv.texture(canvas);
        glflCanv.draw(texture).denoise(15).ink(0.35).brightnessContrast(0.2,0).update();
        if (!this.face) {
            console.error(errors.noface);
            return;
        }
        if (this.face.material.map) {
            this.face.material.map.dispose();
        } else {
            console.warn(errors.nofacemap);
        }
        this.face.material.map = new CanvasTexture(glflCanv);
        this.face.material.needsUpdate = true;
    }

    pickTeam() {
        let r = getRandomInt(0, CONFIG.teams.length - 1);
        let teamString = CONFIG.teams[r];
        this.team = teamString;
    }
}