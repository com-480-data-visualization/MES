import {createCamera, createRenderer, createScene, createOrbitControls} from "./utils/creators";
import {createWorld} from "./worldbuilding/buildWorld";
import {setUpInputs} from "./utils/inputs";
import {startTimeline} from "./utils/timeline";
import * as THREE from "three";
import {Worker} from "./components/worker";
import {mainAnimation} from "./worldbuilding/mainAnimation";
import {setupWelcome, welcomeStandbyAnimation, welcomeTransitionAnimation} from "./worldbuilding/welcomeAnimation";
import {updateInfo} from "./utils/infoPanel";
import {RepositoryCommitPipeline} from "./commitQueue/repositoryCommitPipeline";


const scene = createScene();
const camera = createCamera()
const renderer = createRenderer()
const controls = createOrbitControls(camera,renderer)

const world = createWorld(scene)


let activeWorkers = []

// Connect the repository pipeline to this scene. The pipeline owns fetching and
// queue processing; these callbacks describe how the visual app should react.
const repositoryCommitPipeline = new RepositoryCommitPipeline({
    // Runs once after a valid GitHub URL is submitted.
    onRepoSelected: (owner, repo) => {
        document.getElementById("repoLabel").textContent = `${owner}/${repo}`;
    },

    // Runs for general pipeline messages, such as loading, done, or errors.
    onStatus: updateInfo,

    // Runs every time a commit is consumed from the queue.
    onCommit: (commit, count) => {
        const info = formatCommitInfo(commit, count);
        console.log(info);
        updateInfo(info);
    },


    // Runs only the first time a committer appears, so each committer gets one worker.
    onNewCommitter: async (committer) => {
        await createCommitterWorker(committer);
    }
});

const raycasterEvent = setUpInputs(camera,renderer)

window.addEventListener('click', (event)=>{
    raycasterEvent(event,[world.building,...activeWorkers])}, false);

document.getElementById("repoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!startRepositoryCommitPipeline(event.target.repoUrl.value)) return;
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
    }else{
        console.log("error")
    }
    world.building.update(delta);

    renderer.render(scene, camera);
}


//PROVISIONAL//////////////////////////////////////
const button = document.getElementById("myButton");
button.addEventListener("click", clo);

async function clo(){
    const worker = new Worker(world.building.getBaseCoordinates());
    await worker.loadModel()
    scene.add(worker);
    activeWorkers.push(worker);
}
////////////////////////////////////////////////////

function startRepositoryCommitPipeline(repoUrl) {
    try {
        repositoryCommitPipeline.start(repoUrl);
        return true;
    } catch (error) {
        document.getElementById("repoUrl").setCustomValidity(error.message);
        document.getElementById("repoUrl").reportValidity();
        document.getElementById("repoUrl").setCustomValidity("");
        return false;
    }
}


async function createCommitterWorker(committer) {
    const worker = new Worker(world.building.getBaseCoordinates(), committer);
    await worker.loadModel();
    scene.add(worker);
    activeWorkers.push(worker);
}

function formatCommitInfo(commit, count) {
    const shortSha = commit.sha.slice(0, 7);
    const firstLine = commit.message.split("\n")[0];

    return `#${count} ${shortSha} by ${commit.committer}: ${firstLine}`;
}

startTimeline()
animate()
