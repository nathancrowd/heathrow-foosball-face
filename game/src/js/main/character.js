import * as THREE from 'three';
import {OBJLoader} from '../helper/OBJLoader.js';
import {gsap} from 'gsap';
import { CanvasTexture } from 'three';
import CONFIG from '../helper/config.js';
import fx from '../helper/glfx';
require('../helper/physi');

const errors = {
    nomesh: 'ERROR: Character Mesh has not been created. Try calling load()',
    noface: 'ERROR: Character Face has not been created. Try calling load()',
    nofacemap: 'WARNING: Character Face has no map.'
};

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
        this.index = index;
        this.box = null;
        this.spinPlaying = false;
        this.load();
    }

    load() {
        const loader = new OBJLoader();
        loader.load('/models/character/GamePeice.obj', o => {
            this.geometry = new THREE.Geometry().fromBufferGeometry(o.children[0].geometry);
            this.geometry.translate( 0, -9, 0 );
            this.material = new THREE.MeshLambertMaterial({
                color: 0xedca91,
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.scale.multiplyScalar(0.7);
            this.mesh.position.set(this.position.x,this.position.y,this.position.z);
            this.box = new THREE.Box3().setFromObject( this.mesh );
            this.basePosition = this.mesh.position;
            let faceGeometry = new THREE.CircleGeometry(1,32);
            let faceMat = new THREE.MeshPhongMaterial({
                transparent: true,
                opacity: 1
            });
            this.face = new THREE.Mesh(faceGeometry, faceMat);
            this.face.position.set(0,3.5,1.25);
            this.mesh.add(this.face);
            this.buildPhysicalBox();
            this.createCallback();
        });
    }

    buildPhysicalBox() {
        let box = new Physijs.BoxMesh(
            new THREE.BoxGeometry(this.box.max.x - this.box.min.x, 1.5 * (this.box.max.y - this.box.min.y), this.box.max.z - this.box.min.z),
            Physijs.createMaterial(new THREE.MeshLambertMaterial(), CONFIG.wallFriction,CONFIG.wallBounce),
            0
        );
        box.position.y = -1.5;
        box.visible = false;
        this.mesh.add(box);
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
    }

    moveH(h, duration, delay) {
        if (!this.mesh) {
            console.error(errors.nomesh);
            return;
        }
        
        
        gsap.to(this.mesh.position, {
            duration: duration,
            delay: delay,
            x: h
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
        this.mesh.visible = false;
    }

    show() {
        if (!this.mesh){
            console.error(errors.nomesh);
            return;
        }
        this.mesh.visible = true;
    }

    giveFace(canvas) {
        let glflCanv = fx.canvas();
        let texture = glflCanv.texture(canvas);
        glflCanv.draw(texture).denoise(15).ink(0.35).update();
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
}