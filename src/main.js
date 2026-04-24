import {createCamera, createRenderer, createScene, createOrbitControls} from "./utils/creators";
import {createWorld} from "./worldbuilding/buildWorld";
import {setUpInputs} from "./utils/inputs";
import {startTimeline} from "./utils/timeline";
import * as THREE from "three";
import {GitHubCommitAPI} from "./api/api";
import {Worker} from "./components/worker";
import {mainAnimation} from "./worldbuilding/mainAnimation";
import {setupWelcome, welcomeStandbyAnimation, welcomeTransitionAnimation} from "./worldbuilding/welcomeAnimation";


const scene = createScene();
const camera = createCamera()
const renderer = createRenderer()
const controls = createOrbitControls(camera,renderer)

const world = createWorld(scene)


let activeWorkers = []

const raycasterEvent = setUpInputs(camera,renderer)

window.addEventListener('click', (event)=>{
    raycasterEvent(event,[world.building,...activeWorkers])}, false);

document.getElementById("repoForm").addEventListener("submit", (event) => {
    event.preventDefault();
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
            startTimeline();
        }
    } else if (mode === "visualization") {
        activeWorkers = mainAnimation(activeWorkers,scene,delta,controls)
    }else{
        console.log("error")
    }

    renderer.render(scene, camera);
}


//PROVISIONAL//////////////////////////////////////
const button = document.getElementById("myButton");
button.addEventListener("click", clo);

async function clo(){
    const worker = new Worker();
    await worker.loadModel()
    scene.add(worker);
    activeWorkers.push(worker);
}
////////////////////////////////////////////////////

animate()
