var THREECAMERA;

function createCharacterMat() {
    return new THREE.MeshLambertMaterial({
        color: 0xedca91, //cyan oxidized bronze
        alphaMap: new THREE.TextureLoader().load('./libertyAlphaMapSoft512.png'),
        transparent: true,
        premultipliedAlpha: true
    });
}

function create_faceMaterial(){
    return new THREE.MeshBasicMaterial({
        color: 0xff0000, //RED for debugging purpose
        opacity: 0.5,
        transparent: true,
        side: THREE.DoubleSide,
        premultipliedAlpha: false
    });
}
  

function init(spec) {
    let threeStuffs = THREE.JeelizHelper.init(spec);

    function addFaceMesh(threeFaceMesh) {
        threeFaceMesh.scale.multiplyScalar(1);
        threeFaceMesh.position.set(0,-12.5,-0.5);
        threeStuffs.faceObjects.forEach(o => {
            o.add(threeFaceMesh.clone());
        })
    }

    let charLoader = new THREE.OBJLoader();
    charLoader.load('GamePeice.obj', g => {
        let geo = new THREE.Geometry().fromBufferGeometry(g.children[0].geometry);
        // THREE.JeelizHelper.sortFaces(geo, 'z', true);
        let mesh = new THREE.Mesh(geo, createCharacterMat());
        mesh.renderOrder = 2;
        addFaceMesh(mesh);
    });

    // new THREE.OBJLoader().load('facemask.obj', g => {
    //     // THREE.JeelizHelper.sortFaces(g, 'z', true);
    //     let geo = new THREE.Geometry().fromBufferGeometry(g.children[0].geometry);
    //     let faceMesh=new THREE.Mesh(geo, create_faceMaterial());
    //     faceMesh.renderOrder = 1;
    //     addFaceMesh(faceMesh);
    // });

    var ambientLight=new THREE.AmbientLight(0xffffff, 0.5);
    var dirLight=new THREE.DirectionalLight(0xffffee, 0.7);
    dirLight.position.set(0,0.05,1);
    threeStuffs.scene.add(ambientLight, dirLight);

    // let geo = new THREE.BoxGeometry(1,1,1);
    // let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    // let cube = new THREE.Mesh(geo, material);

    // threeStuffs.faceObjects.forEach(o => {
    //     o.add(cube.clone());
    // })

    var aspecRatio=spec.canvasElement.width / spec.canvasElement.height;
    THREECAMERA=new THREE.PerspectiveCamera(20, aspecRatio, 0.1, 100);
}

function main() {
    let  domCv=document.getElementById('jeelizFaceFilterCanvas');
    domCv.width = window.innerWidth;
    domCv.height = window.innerHeight;
    JEEFACEFILTERAPI.init({
        canvasId: 'jeelizFaceFilterCanvas',
        NNCpath: './dist/NNCwideAngles.json', //path of NNC.json file
        maxFacesDetected: 4,
        callbackReady: function(errCode, spec){
            if (errCode){
                console.log('AN ERROR HAPPENS. ERR =', errCode);
                return;
            }

            console.log('INFO : JEEFACEFILTERAPI IS READY');
            init(spec);
        }, //end callbackReady()

        //called at each render iteration (drawing loop) :
        callbackTrack: function(detectState){
            THREE.JeelizHelper.render(detectState, THREECAMERA);
        } //end callbackTrack()
    });
}

document.addEventListener('DOMContentLoaded', main, false);