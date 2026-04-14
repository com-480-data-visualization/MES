import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {Worker} from './worker.js';
import {Building} from "./building";
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import {generateRuler, startTimeline, updateTimeline} from "./timeline";

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
sky.scale.setScalar(450000); // make it large
scene.add(sky);

// Optional: adjust parameters
const uniforms = sky.material.uniforms;
uniforms['turbidity'].value = 10;
uniforms['rayleigh'].value = 2;
uniforms['mieCoefficient'].value = 0.005;
uniforms['mieDirectionalG'].value = 0.8;

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(100, 100, 100);
scene.add(sun);

sky.material.uniforms['sunPosition'].value.copy(sun.position);


// Floor
const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// Rotate to lie flat (XZ plane)
floor.rotation.x = -Math.PI / 2;

//diavlo
scene.add(floor);

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
    const intersects = raycaster.intersectObjects([building,...activeWorkers],true);

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


