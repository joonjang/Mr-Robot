import * as THREE from 'three';
import { OrbitControls } from './js//OrbitControls.js';
//import { GUI } from './js/lil-gui.module.min.js';
import { TransformControls } from './js/TransformControls.js';

let camera, scene, renderer, controls;
let rollOverMesh, rollOverMaterial, plane;
let cubeGeo, cubeMaterial;
let pointer, raycaster, isShiftDown = false;

const mouse = new THREE.Vector2(1, 1);
const objects = [];
let transformControl;

const params = {
    addPoint: addPoint
};


init();
// render();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    // cubes
    cubeGeo = new THREE.BoxGeometry(50, 50, 50);
    cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, map: new THREE.TextureLoader().load('textures/square-outline-textured.png') });


    // lighting for 3d objects
    const light = new THREE.HemisphereLight(0xffffff, 0x888888);
    light.position.set(0, 1, 0);
    scene.add(light);

    // grid 
    const gridHelper = new THREE.GridHelper(1000, 20);
    scene.add(gridHelper);

    // push objects to plane of grid
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    geometry.rotateX(- Math.PI / 2);
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);

    // gui
    //const gui = new GUI();
    //gui.add(params, 'nothing');
    //gui.open();

    // render commands
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // object selection
    transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('change', render);
    transformControl.addEventListener('dragging-changed', function (event) {
        controls.enabled = !event.value;
    });
    scene.add(transformControl);

    transformControl.addEventListener('objectChange', function () {

        updateSplineOutline();

    });

    // perspective controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.enablePan = false;

    window.addEventListener('resize', onWindowResize);

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);



}

function onPointerMove(event) {

    // pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    // raycaster.setFromCamera( pointer, camera );
    // const intersects = raycaster.intersectObjects( objects, false );
    // if ( intersects.length > 0 ) {
    //     const intersect = intersects[ 0 ];
    //     rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
    //     rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
    //     render();
    // }

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(objects, false);
    if (intersects.length > 0) {
        const object2 = intersects[0].object;
        if (object2 !== transformControl.object) {
            transformControl.attach(object2);
        }

    }
}

function onPointerDown(event) {
    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;
}

function onPointerUp() {
    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    if (onDownPosition.distanceTo(onUpPosition) === 0) transformControl.detach();
}



// sets the box
function addPoint() {

    const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
    // TODO: placeholder coordinate, use user input
    voxel.position.set(Math.random() * 1000 - 500, Math.random() * 100, Math.random() * 1000 - 500);
    scene.add(voxel);

    objects.push(voxel);
    render();

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    raycaster.setFromCamera(mouse, camera);

    render();
}

function render() {
    renderer.render(scene, camera);
}