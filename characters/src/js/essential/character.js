import * as THREE from 'three';
import {OBJLoader} from './OBJLoader';
import {gsap} from 'gsap';
import { CanvasTexture } from 'three';
import { dispose } from '@tensorflow/tfjs-core';

const errors = {
    nomesh: 'ERROR: Character Mesh has not been created. Try calling load()',
    noface: 'ERROR: Character Face has not been created. Try calling load()',
    nofacemap: 'WARNING: Character Face has no map.'
};

export default class Character {
    constructor(index = 0,callback = null) {
        this.mesh = null;
        this.geometry = null;
        this.material = null;
        this.face = null;
        if (callback) {
            this.createCallback = callback;
        }
        this.index = index;
        this.spinPlaying = false;

        this.load();
    }

    load() {
        const loader = new OBJLoader();
        loader.load('../../GamePeice.obj', o => {
            this.geometry = new THREE.Geometry().fromBufferGeometry(o.children[0].geometry);
            this.geometry.translate( 0, -9, 0 );
            this.material = new THREE.MeshLambertMaterial({
                color: 0xedca91,
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.scale.multiplyScalar(0.2);
            switch (this.index) {
                case 0:
                    this.mesh.position.set(-0.75,0,0);
                    break;
                case 1:
                    this.mesh.position.set(0.75,0,0);
                    break;
                case 2:
                    this.mesh.position.set(-0.75,0,-1.5);
                    break;
                case 3:
                    this.mesh.position.set(0.75,0,-1.5);
                    break;
                default:
                    break;
            }

            this.basePosition = this.mesh.position;
            let faceGeometry = new THREE.CircleGeometry(1,32);
            let faceMat = new THREE.MeshPhongMaterial({
                transparent: true,
                opacity: 0.8
            });
            this.face = new THREE.Mesh(faceGeometry, faceMat);
            this.face.position.set(0,3.5,1.25);
            this.mesh.add(this.face);

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
        if (!this.face) {
            console.error(errors.noface);
            return;
        }
        if (this.face.material.map) {
            this.face.material.map.dispose();
        } else {
            console.warn(errors.nofacemap);
        }
        this.face.material.map = new CanvasTexture(canvas[0]);
        this.face.material.needsUpdate = true;
    }
}