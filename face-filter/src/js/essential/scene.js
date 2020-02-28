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

function vertexShader() {
    return `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
                
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
                
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        
        void main(void) {
                    
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);
        
            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
        }
    `;
}

function fragmentShader() {
    return `
        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
                
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
                
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        uniform float uTones; // number of tones
        uniform float uSpecularTones; // number of specular tones
        
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
        
        void main(void) {
                
            // ambient term
            vec3 ambient = uAmbient * uLightAmbient; 
                    
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0, dot(normal,light));
            float tone = floor(lambert * uTones);
            lambert = tone / uTones;
            vec3 diffuse = uDiffuse * uLightDiffuse * lambert; // diffuse term
                    
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light + eye);
            float highlight = pow(max(0.0, dot(normal, halfVec)),uShininess);
            tone = floor(highlight * uSpecularTones);
            highlight = tone / uSpecularTones;
            vec3 specular = uSpecular * uLightSpecular * highlight; // specular term
                    
            // combine to find lit color
            vec3 litColor = ambient + diffuse + specular; 
            
            gl_FragColor = vec4(litColor, 1.0);
            
        } // end main
    `;
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

function oilPaintEffect(canvas, radius, intensity) {
    var ctx = canvas.getContext('2d');
    var width = canvas.width,
        height = canvas.height,
        imgData = ctx.getImageData(0, 0, width, height),
        pixData = imgData.data,
        destCanvas = document.createElement("canvas"),
        dCtx = destCanvas.getContext("2d"),
        pixelIntensityCount = [];

    destCanvas.width = width;
    destCanvas.height = height;

    // for demo purposes, remove this to modify the original canvas
    // document.body.appendChild(destCanvas);

    var destImageData = dCtx.createImageData(width, height),
        destPixData = destImageData.data,
        intensityLUT = [],
        rgbLUT = [];

    for (var y = 0; y < height; y++) {
        intensityLUT[y] = [];
        rgbLUT[y] = [];
        for (var x = 0; x < width; x++) {
            var idx = (y * width + x) * 4,
                r = pixData[idx],
                g = pixData[idx + 1],
                b = pixData[idx + 2],
                avg = (r + g + b) / 3;

            intensityLUT[y][x] = Math.round((avg * intensity) / 255);
            rgbLUT[y][x] = {
                r: r,
                g: g,
                b: b
            };
        }
    }


    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {

            pixelIntensityCount = [];

            // Find intensities of nearest pixels within radius.
            for (var yy = -radius; yy <= radius; yy++) {
                for (var xx = -radius; xx <= radius; xx++) {
                    if (y + yy > 0 && y + yy < height && x + xx > 0 && x + xx < width) {
                        var intensityVal = intensityLUT[y + yy][x + xx];

                        if (!pixelIntensityCount[intensityVal]) {
                            pixelIntensityCount[intensityVal] = {
                                val: 1,
                                r: rgbLUT[y + yy][x + xx].r,
                                g: rgbLUT[y + yy][x + xx].g,
                                b: rgbLUT[y + yy][x + xx].b
                            }
                        } else {
                            pixelIntensityCount[intensityVal].val++;
                            pixelIntensityCount[intensityVal].r += rgbLUT[y + yy][x + xx].r;
                            pixelIntensityCount[intensityVal].g += rgbLUT[y + yy][x + xx].g;
                            pixelIntensityCount[intensityVal].b += rgbLUT[y + yy][x + xx].b;
                        }
                    }
                }
            }

            pixelIntensityCount.sort(function (a, b) {
                return b.val - a.val;
            });

            var curMax = pixelIntensityCount[0].val,
                dIdx = (y * width + x) * 4;

            destPixData[dIdx] = ~~ (pixelIntensityCount[0].r / curMax);
            destPixData[dIdx + 1] = ~~ (pixelIntensityCount[0].g / curMax);
            destPixData[dIdx + 2] = ~~ (pixelIntensityCount[0].b / curMax);
            destPixData[dIdx + 3] = 255;
        }
    }

    // change this to ctx to instead put the data on the original canvas
    ctx.putImageData(destImageData, 0, 0);
}

const filters = [
    'none',
    'oil',
    'glfl',
    'caman1',
    'caman2',
];

function cloneCanvas(canvas) {
    let rCanvas = document.createElement('canvas');
    let rCtx = rCanvas.getContext('2d');
    rCanvas.width = canvas.width;
    rCanvas.height = canvas.height;
    rCtx.drawImage(canvas, 0, 0);

    return rCanvas;
}

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

async function addFace(canvas) {
    filters.forEach((f,i) => {
        switch (f) {
            case 'none':
                let defaultCanvas = cloneCanvas(canvas);
                drawFace(defaultCanvas,i);
                break;
            case 'oil':
                let oilCanvas = cloneCanvas(canvas);
                oilPaintEffect(oilCanvas, 2, 50);
                drawFace(oilCanvas,i);
                break;
            case 'caman1':
                let camanCanv1 = cloneCanvas(canvas);
                console.log('Scene: Starting filter draw...');
                Caman(camanCanv1, function () {
                    this.brightness(12);
                    this.clip(36);
                    this.contrast(-15);
                    this.saturation(-50);
                    this.exposure(10);
                    this.render(() => {
                        drawFace(camanCanv1,i);
                    });
                });
                break;
            case 'caman2':
                let camanCanv2 = cloneCanvas(canvas);
                console.log('Scene: Starting filter draw...');
                Caman(camanCanv2, function () {
                    this.newLayer(function () {
                        this.copyParent();
                        this.filter.posterize(6);
                        this.filter.contrast(10);
                        this.setBlendingMode("overlay");
                    });

                    this.render(() => {
                        drawFace(camanCanv2,i);
                    });
                });
                break;
            case  'glfl':
                let glflCanv = fx.canvas();
                let texture = glflCanv.texture(canvas);
                glflCanv.draw(texture).denoise(15).ink(0.35).update();
                drawFace(glflCanv,i);
                break;
            default:
                break;
        }
    })
    
}
(() => {
    // Caman.Filter.register("posterize", function (adjust) {
    //     // Pre-calculate some values that will be used
    //     var numOfAreas = 256 / adjust;
    //     var numOfValues = 255 / (adjust - 1);
      
    //     // Our process function that will be called for each pixel.
    //     // Note that we pass the name of the filter as the first argument.
    //     this.process("posterize", function (rgba) {
    //         rgba.r = Math.floor(Math.floor(rgba.r / numOfAreas) * numOfValues);
    //         rgba.g = Math.floor(Math.floor(rgba.g / numOfAreas) * numOfValues);
    //         rgba.b = Math.floor(Math.floor(rgba.b / numOfAreas) * numOfValues);
    
    //         // Return the modified RGB values
    //         return rgba;
    //     });
    // });
})();
export {
    createScene,
    addFace
}