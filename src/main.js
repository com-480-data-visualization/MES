import {createCamera, createRenderer, createScene, createOrbitControls} from "./utils/creators";
import {createWorld} from "./worldbuilding/buildWorld";
import {setUpInputs} from "./utils/inputs";
import {startTimeline} from "./utils/timeline";
import * as THREE from "three";
import {Worker} from "./components/worker";
import {mainAnimation} from "./worldbuilding/mainAnimation";
import {setupWelcome, welcomeStandbyAnimation, welcomeTransitionAnimation} from "./worldbuilding/welcomeAnimation";
import {startGraph} from "./components/generalCommitsGraph";
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
const workers = new Map()
let infoRepo = false



const raycasterEvent = setUpInputs(camera,renderer)

window.addEventListener('click', (event)=>{
    raycasterEvent(event,[world.building,...activeWorkers])}, false);
document.getElementById("repoForm").addEventListener("submit",  async (event) => {
    event.preventDefault();
    infoRepo = await setUpCommitPipeline(event.target.repoUrl.value, queue)
    if (infoRepo === false) return;
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
        if (!ongoing) {
            mode = "visualization";
            startTimeline()
        }
    } else if (mode === "visualization") {
        activeWorkers = mainAnimation(activeWorkers,scene,delta,controls)
        manageCommits(delta,queue, userRegistry, world.building)
    }else{
        console.log("error")
    }


    renderer.render(scene, camera);
}



export async function createWorker(id) {
    const worker = new Worker(world.building.getBaseCoordinates(), id);
    await worker.loadModel();
    scene.add(worker);
    activeWorkers.push(worker);
    workers.set(id, worker);
}

export function getWorker(id) {
    return workers.get(id)
}


export function setBuilding(time){
    world.building.setDuration(time)
}

export function reviveWorker(id){
    const w = workers.get(id)
    if (!activeWorkers.includes(w)) {
        activeWorkers.push(w);
        console.log("pushin")
    }
    scene.add(w)
}


startGraph()
animate()

if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        renderer.dispose();
    });
}
