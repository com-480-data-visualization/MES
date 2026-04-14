import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {Worker} from './worker.js';
import {Building} from "./building";
import { Sky } from './sky.js';
import {generateRuler, startTimeline, updateTimeline} from "./timeline";
import {Tile} from "./tile";

// Scene
const scene = new THREE.Scene();
//scene.background = new THREE.Color(0xfffffff);

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
await worker.loadModel()
scene.add(worker);
const worker2 = new Worker();
await worker2.loadModel()
scene.add(worker2);

let activeWorkers = [worker,worker2]


// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // smooth movement
controls.minDistance = 30
controls.maxDistance = 200

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});




const sky = new Sky();
scene.add(sky);


// Floor
const tile = new Tile(1000, 100);
scene.add(tile);

const clock = new THREE.Timer();

function animate() {
    requestAnimationFrame(animate);


    clock.update()
    const delta = clock.getDelta();

    activeWorkers = activeWorkers.filter(worker => {
        if (worker.getMode() > 2) {
            scene.remove(worker);
            return false; // remove from array
        }

        worker.update(delta);
        return true; // keep
    });


    //building.upgrade(t)

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
    const intersects = raycaster.intersectObjects([building, tile, ...activeWorkers],true);

    if (intersects.length > 0) {
        let objectHit = intersects[0].object;

        while (objectHit && !objectHit.onClick) {
            objectHit = objectHit.parent; // walk up
        }

        if (objectHit?.onClick) {
            objectHit.onClick();
        }
    }
}

const button = document.getElementById("myButton");
button.addEventListener("click", clo);

async function clo(){
    const worker = new Worker();
    await worker.loadModel()
    scene.add(worker);
    activeWorkers.push(worker);
}
startTimeline()
animate();


