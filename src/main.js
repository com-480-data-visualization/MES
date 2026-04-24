import {createCamera, createRenderer, createScene, createOrbitControls} from "./utils/creators";
import {createWorld} from "./workers/buildWorld";
import {setUpInputs} from "./utils/inputs";
import {startTimeline} from "./utils/timeline";
import * as THREE from "three";
import {GitHubCommitAPI} from "./api/api";
import {Worker} from "./components/worker";


const scene = createScene();
const camera = createCamera()
const renderer = createRenderer()
const controls = createOrbitControls(camera,renderer)

const world = createWorld(scene)


let activeWorkers = []

const raycasterEvent = setUpInputs(camera,renderer)
window.addEventListener('click', (event)=>{
    raycasterEvent(event,[world.building,...activeWorkers])}, false);


const clock = new THREE.Timer();

function animate() {
    requestAnimationFrame(animate);


    const delta = clock.update().getDelta()


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



const button = document.getElementById("myButton");
button.addEventListener("click", clo);

async function clo(){
    const worker = new Worker();
    await worker.loadModel()
    scene.add(worker);
    activeWorkers.push(worker);
}

startTimeline()
animate()
