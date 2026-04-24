import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {Worker} from './workers/worker.js';
import {Building} from "./components/building";
import { Sky } from './components/sky.js';
import {generateRuler, startTimeline, updateTimeline} from "./utils/timeline";
import {Tile} from "./components/tile";
import { GitHubCommitAPI } from './api/api.js';

const welcomeOverlay = document.getElementById("welcomeOverlay");
const repoForm = document.getElementById("repoForm");
const repoInput = document.getElementById("repoUrl");
const repoLabel = document.getElementById("repoLabel");
const vizUiElements = document.querySelectorAll(".viz-ui");

const welcomeCameraPosition = new THREE.Vector3(27, 9, 29);
const welcomeCameraTarget = new THREE.Vector3(35, 2.5, 43);
const mainCameraPosition = new THREE.Vector3(42, 34, 48);
const mainCameraTarget = new THREE.Vector3(0, 2.5, 0);
const cameraTarget = welcomeCameraTarget.clone();

let experienceState = "welcome";
let transitionTime = 0;
const transitionDuration = 3.2;

function applyCameraPose(position, target) {
    camera.position.copy(position);
    cameraTarget.copy(target);
    controls.target.copy(target);
    camera.lookAt(target);
}

// Scene
const scene = new THREE.Scene();
//scene.background = new THREE.Color(0xfffffff) ;

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.copy(welcomeCameraPosition);
camera.lookAt(cameraTarget);

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
worker.visible = false;
scene.add(worker);
const worker2 = new Worker();
await worker2.loadModel()
worker2.visible = false;
scene.add(worker2);

let activeWorkers = [worker,worker2]


// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // smooth movement
controls.minDistance = 30
controls.maxDistance = 200
controls.enabled = false;
controls.target.copy(cameraTarget);

// API instance
const api = new GitHubCommitAPI();
let commitsFetched = false;

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});




const sky = new Sky();
scene.add(sky);


// Floor
const tile = new Tile(100, 10);
scene.add(tile);

const welcomeWorker = new Worker();
welcomeWorker.curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(49, 2.5, 27),
    new THREE.Vector3(43, 2.5, 32),
    new THREE.Vector3(36, 2.5, 36),
    new THREE.Vector3(28, 2.5, 37),
]);
welcomeWorker.t = 0;
await welcomeWorker.loadModel();
welcomeWorker.scale.setScalar(1.15);
scene.add(welcomeWorker);

function smoothStep(t) {
    return t * t * (3 - 2 * t);
}

function startVisualizationTransition() {
    if (experienceState !== "welcome") {
        return;
    }

    experienceState = "transitioning";
    transitionTime = 0;
    applyCameraPose(welcomeCameraPosition, welcomeCameraTarget);
    welcomeOverlay.classList.add("is-leaving");

    const enteredRepo = repoInput.value.trim();
    if (enteredRepo && repoLabel) {
        repoLabel.textContent = enteredRepo;
    }
}

function finishVisualizationTransition() {
    experienceState = "visualization";
    activeWorkers.forEach((worker) => {
        worker.visible = true;
    });
    controls.enabled = true;
    controls.target.copy(mainCameraTarget);
    cameraTarget.copy(mainCameraTarget);
    welcomeOverlay.classList.add("is-hidden");
    vizUiElements.forEach((element) => element.classList.remove("is-hidden"));
}

repoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    startVisualizationTransition();
});

const clock = new THREE.Timer();

function animate() {
    requestAnimationFrame(animate);


    clock.update()
    const delta = clock.getDelta();

    welcomeWorker.update(delta);
    if (welcomeWorker.getMode() === 1) {
        welcomeWorker.mode = 3;
        welcomeWorker.c = 0;
        welcomeWorker.lookAt(27, 2.5, 29);
        welcomeWorker.changeAnimation(4); // animation to chose
    }
    if (welcomeWorker.getMode() === 999) {
        welcomeWorker.mode = 0;
        welcomeWorker.t = 0;
        welcomeWorker.changeAnimation(10);
    }

    if (experienceState === "visualization") {
        activeWorkers = activeWorkers.filter(worker => {
            if (worker.getMode() > 2) {
                scene.remove(worker);
                return false; // remove from array
            }

            worker.update(delta);
            return true; // keep
        });
    }

    // call the api here 
    if (!commitsFetched) {
        commitsFetched = true;
        api.fetchAllCommits("octocat", "Hello-World").then(commits => {
            console.log("Fetched commits:", commits.length);
            // Do something with commits, e.g., log summaries
            const summaries = commits.map(GitHubCommitAPI.getCommitSummary);
            console.log("Commit summaries:", summaries);
        }).catch(err => console.error("Error fetching commits:", err));
    }

    //building.upgrade(t)

    if (experienceState === "welcome") {
        applyCameraPose(welcomeCameraPosition, welcomeCameraTarget);
    }

    if (experienceState === "transitioning") {
        transitionTime += delta;
        const progress = Math.min(transitionTime / transitionDuration, 1);
        const easedProgress = smoothStep(progress);

        camera.position.lerpVectors(welcomeCameraPosition, mainCameraPosition, easedProgress);
        cameraTarget.lerpVectors(welcomeCameraTarget, mainCameraTarget, easedProgress);
        camera.lookAt(cameraTarget);

        if (progress >= 1) {
            finishVisualizationTransition();
        }
    }

    if (experienceState === "visualization") {
        scene.remove(welcomeWorker);
        controls.update();
    }

    renderer.render(scene, camera);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', onClick, false);

function onClick(event) {
    if (experienceState !== "visualization") {
        return;
    }

    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Array of objects to test for intersection
    const intersects = raycaster.intersectObjects([building, ...activeWorkers],true);

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
    worker.visible = experienceState === "visualization";
    scene.add(worker);
    activeWorkers.push(worker);
}


startTimeline()
animate();
