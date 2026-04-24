import {createCamera, createRenderer, createScene, createOrbitControls} from "./utils/creators";
import {createWorld} from "./worldbuilding/buildWorld";
import {setUpInputs} from "./utils/inputs";
import {startTimeline} from "./utils/timeline";
import * as THREE from "three";
import {Worker} from "./components/worker";
import {mainAnimation} from "./worldbuilding/mainAnimation";
import {setupWelcome, welcomeStandbyAnimation, welcomeTransitionAnimation} from "./worldbuilding/welcomeAnimation";
import {updateInfo} from "./utils/infoPanel";
import {manageCommits, setUpCommitPipeline} from "./commitQueue/repositoryCommitPipeline";
import {AsyncQueue} from "./utils/asyncQueue";


const scene = createScene();
const camera = createCamera()
const renderer = createRenderer()
const controls = createOrbitControls(camera,renderer)

const world = createWorld(scene)


let activeWorkers = []
const queue = new AsyncQueue()
const userRegistry = new Map()


const raycasterEvent = setUpInputs(camera,renderer)

window.addEventListener('click', (event)=>{
    raycasterEvent(event,[world.building,...activeWorkers])}, false);

document.getElementById("repoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!setUpCommitPipeline(event.target.repoUrl.value,queue)) return;
    mode = "transition"
});


const clock = new THREE.Timer();
let mode = "welcome"
let ongoing = false;
await setupWelcome(scene,camera,controls)

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.update().getDelta()

    if (mode === "welcome") {
        welcomeStandbyAnimation(activeWorkers,scene,delta,controls)
    } else if (mode === "transition") {
        ongoing = welcomeTransitionAnimation(activeWorkers,scene,delta,controls,camera)
        if (!ongoing) {mode = "visualization"}
    } else if (mode === "visualization") {
        activeWorkers = mainAnimation(activeWorkers,scene,delta,controls)
        manageCommits(delta,queue, userRegistry)
    }else{
        console.log("error")
    }
    world.building.update(delta);

    renderer.render(scene, camera);
}



export async function createWorker(id) {
    const worker = new Worker(world.building.getBaseCoordinates(), id);
    await worker.loadModel();
    scene.add(worker);
    activeWorkers.push(worker);
}


startTimeline()
animate()
