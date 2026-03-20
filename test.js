import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {Worker} from './worker.js';
import {Building} from "./building";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfffffff);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(3, 3, 5);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//building
const building = new Building()
scene.add(building)


//worker
const worker = new Worker();
scene.add(worker);


// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // smooth movement

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



// Floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// Rotate to lie flat (XZ plane)
floor.rotation.x = -Math.PI / 2;


scene.add(floor);

let t = 0;       // progress along the path
let speed = 0.001; // adjust speed

function animate() {
    requestAnimationFrame(animate);

    t += speed;
    if (t > 1 || t < 0) speed *= -1; // reverse direction at ends

    worker.goWork(t)
    building.upgrade(t)

    controls.update();
    renderer.render(scene, camera);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onClick, false);

function onClick(event) {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Array of objects to test for intersection
    const intersects = raycaster.intersectObjects([building]);

    if (intersects.length > 0) {
        // Cube was clicked!
        alert('You clicked the cube!');
    }
}

animate();


