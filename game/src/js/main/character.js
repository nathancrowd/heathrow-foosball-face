import * as THREE from 'three';
import {OBJLoader} from '../helper/OBJLoader.js';
import {GLTFLoader} from '../helper/gltfLoader.js';
import {MTLLoader} from '../helper/MTLLoader.js';
import {gsap} from 'gsap';
import { CanvasTexture, Texture } from 'three';
import CONFIG from '../helper/config.js';
import fx from '../helper/glfx';
import * as score from './score';
import getRandomInt from '../helper/randomInt';
import * as Sound from './sound';
import { loadTinyFaceDetectorModel } from 'face-api.js';
require('../helper/physi');
import * as State from '../helper/state';

const errors = {
    nomesh: 'ERROR: Character Mesh has not been created. Try calling load()',
    noface: 'ERROR: Character Face has not been created. Try calling load()',
    nofacemap: 'WARNING: Character Face has no map.'
};

const blankVector = new THREE.Vector3(0,0,0);
const fullVector =  new THREE.Vector3(1,1,1);

class Character {
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
        const matload = new MTLLoader();
        let modelUrl = this.getModel();
        let materialUrl = this.getMaterial();
        matload.load(materialUrl, materials => {
            materials.preload();
            loader.setMaterials( materials );
            loader.load(modelUrl, o => {
                // this.geometry = new THREE.Geometry().fromBufferGeometry(o.children[0].geometry);
                o.children[0].castShadow = true;
                o.children[0].receiveShadow = false;
                o.children[0].geometry.translate( 0, -9, 0 );
                o.children[0].geometry.computeBoundingBox();
                o.children[0].name = 'Player';
                let size = new THREE.Vector3();
                o.children[0].geometry.boundingBox.getSize(size)
                o.children[0].material.forEach(m => {
                    if (m.name == 'Material') {
                        m.opacity = 1;
                        m.alphaMap = null;
                        m.map.wrapT = THREE.MirroredRepeatWrapping;
                        let mapping = this.getMapping();
                        m.map.flipY = mapping.flipY;
                        
                        // m.map.format = THREE.RGBFormat;
                        m.map.rotation = mapping.rotation;
                        m.map.offset.x = mapping.offset.x;
                        m.map.offset.y = mapping.offset.y;
                        m.map.repeat.x = mapping.repeat.x;
                        m.map.repeat.x = mapping.repeat.x;
                        m.map.needsUpdate = true;
                    }
                });
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
                this.loadFacemask();
                // let faceGeometry = new THREE.CircleGeometry(2,32);
                // let faceMat = new THREE.MeshBasicMaterial({
                // });
                // this.face = new THREE.Mesh(faceGeometry, faceMat);
                // o.add(this.face);
                this.listenForCollision();
                this.done();
                this.createCallback();
            }, null, error => {});

        }, null, error => {});
    }

    done() {

    }

    loadFacemask() {
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('/models/character/facemask.gltf', f => {
            this.face = f.scene.children[0];
            // this.face.geometry = new THREE.Geometry().fromBufferGeometry(this.face.geometry);
            this.face.geometry.uvsNeedUpdate = true;
            this.face.geometry.computeFaceNormals();
            this.face.geometry.computeVertexNormals();
            // this.face.material = new THREE.MeshBasicMaterial();
            this.face.name = 'Face';
            this.face.position.set(0,5.6,2.637);
            this.face.scale.set(2.6,2.6,2.6);
            this.mesh.add(this.face);
        });
    }

    listenForCollision() {
        this.mesh.addEventListener('collision', (co,v,r,n) => {
            co.setLinearVelocity(new THREE.Vector3(0,0,0));
            if (Sound.running) {
                Sound.kick();
            }
            this.kick();
            if (State.getStage() == 1) {
                score.increment();
            }
            co.setLinearVelocity(new THREE.Vector3(0,15,CONFIG.ballSpeed));
            setTimeout(() => {
                if (this.scene && State.getStage() == 1) {
                    this.scene.remove(co);
                }
            }, CONFIG.kickedBallDecay);
        });
    }

    addToScene(scene) {
        if (!this.mesh) {
            console.error(errors.nomesh);
            return;
        }
        scene.add(this.mesh);
        this.scene = scene;
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
        if (!canvas) {
            return;
        }
        // let glflCanv = fx.canvas();
        // let texture = glflCanv.texture(canvas);
        // glflCanv.draw(texture).denoise(15).ink(0.35).brightnessContrast(0.2,0).update();
        if (!this.face) {
            console.error(errors.noface);
            return;
        }
        
        if (this.face.material.map) {
            // this.face.material.map.dispose();
        } else {
            console.warn(errors.nofacemap);
        }
        this.face.material.metalness = 0;
        let canvasT = new CanvasTexture(canvas);
        this.face.geometry.computeBoundingBox();
        this.face.material.map = canvasT;
        this.face.material.map.rotation = 1.5708;
        this.face.material.map.offset.y = 0.9;
        this.face.material.map.repeat.y = 1.3;
        this.face.material.map.repeat.x = 1.3;
        this.face.material.map.offset.x = -0.1;
        this.face.material.map.wrapS = this.face.material.map.wrapT = THREE.ClampToEdgeWrapping;
        this.face.material.needsUpdate = true;
        console.log(this.face);
        
    }

    pickTeam() {
        let r = getRandomInt(0, CONFIG.teams.length - 1);
        this.team = r;
    }

    getModel() {
        return CONFIG.teams[this.team].object;
    }

    getMaterial() {
        return CONFIG.teams[this.team].material;
    }

    getMapping() {
        return CONFIG.teams[this.team].mapping;
    }

    done() {
        
    }

    transparent() {
        this.mesh.children.forEach(c => {
            setOpacity(c, 0.5);
        });
    }
}

function setOpacity(item, opacity) {
    if (item.material) {
        item.material.transparent = true;
        item.material.opacity = opacity;
        if (item.material.length) {
            item.material.forEach(m => {
                m.transparent = true;
                m.opacity = opacity;
                setOpacity(m, opacity);
            });
        }
    }
    if (item.children) {
        item.children.forEach(i => {
            setOpacity(i, opacity);
        });
    }
}

class GoalKeeper extends Character {
    constructor(index = 0,callback = null,position = {}) {
        super(index, callback, position);
    }

    listenForCollision() {
        this.mesh.addEventListener('collision', (co,v,r,n) => {
            co.setLinearVelocity(new THREE.Vector3(0,0,0));
            if (Sound.running) {
                // Sound.kick();
            }
            this.kick();
            co.setLinearVelocity(new THREE.Vector3(0,15,-CONFIG.ballSpeed));
        });
    }

    pickTeam() {
        this.team = null;
    }

    getModel() {
        return CONFIG.keeper.object;
    }

    getMaterial() {
        return CONFIG.keeper.material;
    }

    getMapping() {
        return CONFIG.keeper.mapping;
    }

    kick() {
        if (!this.mesh) {
            console.error(errors.nomesh);
            return;
        }
        let tl = new gsap.timeline();
        tl.to(this.mesh.rotation, {
            duration: 0.1,
            x: -3.14159 + -0.0523599
        }).to(this.mesh.rotation, {
            duration: 0.3,
            x: -3.14159 + 0.785398
        }).to(this.mesh.rotation, {
            duration: 0.2,
            x: -3.14159
        });
        tl.play();
        this.mesh.__dirtyRotation = true;
    }

    done() {
        if (!this.mesh) {
            console.error(errors.nomesh);
            return;
        }
        this.mesh.rotation.y = 3.14159;
        this.defend();
    }

    defend() {
        // let tl = new gsap.timeline({
        //     repeat: -1,
        //     yoyo: true
        // });
        // this.mesh.position.x = -1;
        // tl.to(this.mesh.position, {
        //     duration: CONFIG.keeperSpeed,
        //     x: -15,
        // }).to(this.mesh.position, {
        //     duration: CONFIG.keeperSpeed,
        //     x: -1,
        // });
        setInterval(() => {
            this.moveH(getRandomInt(-(CONFIG.maxXMovement - 2), (CONFIG.maxXMovement - 2)), CONFIG.keeperSpeed * 0.8, 0);
        }, CONFIG.keeperSpeed * 1000);
    }

    loadFacemask() {
        return;
    }
}

export {
    Character,
    GoalKeeper
}