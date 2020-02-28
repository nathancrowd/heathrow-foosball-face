import * as THREE from 'three';
import config from '../essential/config';
import {OrbitControls} from '../essential/OrbitControls';
import * as faces from '../essential/faces';
import Character from '../essential/character';
// import * as comlink from 'comlink';

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let characters = [];
let size = {
    width: null,
    height: null
};
let poses = null;
let balls = null;
let posePositions = [];

const radius = 0.4;
const range = 3 - radius;

const clock = new THREE.Clock();
const delta = clock.getDelta() * 0.8; // slow down simulation
var normal = new THREE.Vector3();
var relativeVelocity = new THREE.Vector3();

let currentStage = 0;

let getPoseXPos = (pose) => {
    // let currentX = 0;
    let left = pose.keypoints[5].position.x;
    let right = pose.keypoints[6].position.x;
    let currentX = (left + right) / 2;

    return currentX;
}

let getPoseArmPos = (pose) => {
    return {
        right: pose.keypoints[9].position.y,
        left: pose.keypoints[10].position.y
    };
}

let followMovement = (poses) => {
    poses.forEach((p, i) => {
        if (!characters[i]) {
            return;
        }
        let pos = getPoseXPos(p);
        let relPos = pos / size.width;
        characters[i].moveH((relPos * (2 * config.maxXMovement)) - config.maxXMovement, config.movementDuration, 0);
        if (posePositions[i]) {
            let diff = posePositions[i] - relPos;
            characters[i].swing(config.movementDuration, diff);
        }
        posePositions[i] = relPos;
    });
}

let listenForSpin = (poses) => {
    poses.forEach((p, i) => {
        if (!characters[i]) {
            return;
        }
        let currentArmPos = getPoseArmPos(p);
        let relArmPos = {
            right: currentArmPos.right / size.height,
            left: currentArmPos.left / size.height
        };

        if (relArmPos.right < 0.5 && relArmPos.left < 0.5) {
            if (!characters[i].isSpinning()) {
                characters[i].spinChar('backwards');
            }
        }
    });
}

let buildCharacters = (index) => {
    let character = new Character(index, () => {
        character.addToScene(scene);
    });
    return character;
}
let render = () => {

    var delta = clock.getDelta() * 0.8; // slow down simulation

    setTimeout(() => {
        requestAnimationFrame(render);
    }, 1000 / config.threeJsMaxFps);
    renderer.render(scene, camera);
    // controls.update();
    if (poses) {
        let faceCanvases = faces.getFaces();
        characters.forEach((c, i) => {
            if (faceCanvases[i]) {
                c.giveFace(faceCanvases[i]);
            }
            if (i >= poses.length) {
                c.hide();
            } else {
                c.show();
            }
        });
        switch (config.stages[currentStage]) {
            case 'playerMovement':
                followMovement(poses);
                break;
            case 'playerSpin':
                listenForSpin(poses);
                break;
            case 'playerKick':
                // TODO listen for a gesture that triggers a ball kick
                break;
            default:
                break;
        }
    }

    balls.render();
}

let buildPoles = () => {
    let pole1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 100, 32),
        new THREE.MeshPhongMaterial({
            color: new THREE.Color(0x858585)
        })
    );
    pole1.position.set(0, -0.04, 0);
    pole1.rotation.set(0, 0, 1.5708);
    scene.add(pole1);

    let pole2 = pole1.clone();
    pole2.position.set(0, -0.04, -1.5);
    scene.add(pole2);
};


let init = (canvas) => {
    scene = new THREE.Scene();

    //scene.background = new THREE.Color(0x476643);
    camera = new THREE.PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: canvas
    });


    var loader = new THREE.ImageBitmapLoader();
    loader.load('textures/grasslight-small.jpg', function (imageBitmap) {
        var groundTexture = new THREE.CanvasTexture(imageBitmap);
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(25, 25);
        groundTexture.anisotropy = 16;
        groundTexture.encoding = THREE.sRGBEncoding;
        var groundMaterial = new THREE.MeshLambertMaterial({map: groundTexture});

        var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
        mesh.position.y = -250;
        mesh.rotation.x = -Math.PI / 3; // larger the divider, higher up the page the grass goes.
        mesh.receiveShadow = true;
        scene.add(mesh);
    });

    // controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 5;
    camera.position.x = 0;
    camera.position.y = 1.5;
    //controls.update();
    renderer.setSize(size.width, size.height, false);
    // document.body.appendChild(renderer.domElement);

    let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    let dirLight = new THREE.DirectionalLight(0xffffee, 0.7);
    dirLight.position.set(0, 0.05, 1);
    scene.add(ambientLight, dirLight);
    buildPoles();
    for (let index = 0; index < config.maxPlayers; index++) {
        characters[index] = buildCharacters(index);
    }
    balls = new Balls(scene);
    render();
}
self.addEventListener('message', function (message) {
    switch (message.data.action) {
        case 'init':
            size.width = message.data.width;
            size.height = message.data.height;
            let canvas = message.data.canvas;
            init(canvas);
            break;
        case 'send_poses':
            poses = message.data.poses;
            break;
        default:
            break;
    }

}, false);

class Balls {
    constructor(_scene, count = 10) {
        this.myScene = _scene;
        this.myBalls = [];
        this.__build()
    }

    __build(count = 10) {
        var geometry = new THREE.IcosahedronBufferGeometry(radius, 2);

        var loader = new THREE.ImageBitmapLoader();

        let _balls = this.myBalls; // scope borked because of call back function below, hence need ref to 'this' vars.
        let _scene = this.myScene;

        loader.load('textures/football.jpg', function (imageBitmap) {

            var ballTexture = new THREE.CanvasTexture(imageBitmap);
            var material = new THREE.MeshPhongMaterial({
                map: ballTexture,
                bumpMap: ballTexture,
                bumpScale: 0.01,
            });

            var mesh = new THREE.Mesh(geometry, material);

            for (let i = 0; i < count; i++) {

                let ball = mesh.clone();

                ball.geometry.center();

                ball.position.x = Math.random() * 4 - 2;
                ball.position.y = Math.random() * 4;
                ball.position.z = Math.random() * 4 - 2;

                ball.userData.velocity = new THREE.Vector3();
                ball.userData.velocity.x = Math.random() * 0.5 - 0.005;
                ball.userData.velocity.y = Math.random() * 0.5 - 0.005;
                ball.userData.velocity.z = Math.random() * 0.5 - 0.005;


                //below not working as expected. Assuming rotating not around center point.
                ball.userData.rotation = new THREE.Vector2();
                ball.userData.rotation.x = Math.random() * Math.PI * 2;
                ball.userData.rotation.y = Math.random() * Math.PI * 2;

                ball.rotation.x = ball.userData.rotation.x;
                ball.rotation.y = ball.userData.rotation.y;

                _scene.add(ball);
                _balls.push(ball);
            }
        });
    }

    render() {
        this.myBalls.forEach(ball => {

            ball.userData.velocity.x *= .98;
            ball.userData.velocity.y *= .98;
            ball.userData.velocity.z *= .98;

            ball.position.x += ball.userData.velocity.x;
            ball.position.y += ball.userData.velocity.y ;
            ball.position.z += ball.userData.velocity.z ;

            ball.userData.rotation.x *= .9;
            ball.userData.rotation.y *= .9;

            ball.rotation.x += ball.userData.rotation.x;
            ball.rotation.y += ball.userData.rotation.y;

            if (ball.position.x < -range || ball.position.x > range) {
                ball.position.x = THREE.MathUtils.clamp(ball.position.x, -range, range);
                ball.userData.velocity.x = -ball.userData.velocity.x;
            }

            if (ball.position.y < radius || ball.position.y > 6) {
                ball.position.y = Math.max(ball.position.y, radius);
                ball.userData.velocity.x *= 0.98;
                ball.userData.velocity.y = -ball.userData.velocity.y * 0.8;
                ball.userData.velocity.z *= 0.98;
            }

            if (ball.position.z < -range || ball.position.z > range) {

                ball.position.z = THREE.MathUtils.clamp(ball.position.z, -range, range);
                ball.userData.velocity.z = -ball.userData.velocity.z;

            }
        });
    }
}