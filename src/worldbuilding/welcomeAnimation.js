import * as THREE from "three";
import {Worker} from '../components/worker.js';
import {palette} from "../utils/palette.js";


const welcomeOverlay = document.getElementById("welcomeOverlay");
const vizUiElements = document.querySelectorAll(".viz-ui");

const welcomeCameraPosition = new THREE.Vector3(27, 9, 29);
const welcomeCameraTarget = new THREE.Vector3(35, 2.5, 43);
const mainCameraPosition = new THREE.Vector3(42, 34, 48);
const mainCameraTarget = new THREE.Vector3(0, 2.5, 0);
const cameraTarget = welcomeCameraTarget.clone();
let welcomeWorker = {}
let welcomeCameraLight = null;

let onGoingTransition = false;
let transitionTime = 0;
const transitionDuration = 3.2;

function applyCameraPose(camera, controls, position, target) {
    camera.position.copy(position);
    cameraTarget.copy(target);
    controls.target.copy(target);
    camera.lookAt(target);
}

function smoothStep(t) {
    return t * t * (3 - 2 * t);
}

function createWelcomeCameraLight() {
    const light = new THREE.PointLight(palette.sun, 7, 90, 1.4);
    light.position.copy(welcomeCameraPosition);
    return light;
}

function setWelcomeCameraLightEnabled(enabled) {
    if (!welcomeCameraLight) {
        return;
    }

    welcomeCameraLight.visible = enabled;
    welcomeCameraLight.intensity = enabled ? 7 : 0;
}

function startVisualizationTransition(camera,controls) {
    transitionTime = 0;
    applyCameraPose(camera,controls,welcomeCameraPosition, welcomeCameraTarget);
    setWelcomeCameraLightEnabled(false);
    welcomeOverlay.classList.add("is-leaving");
}

function finishVisualizationTransition(controls) {
    controls.enabled = true;
    controls.target.copy(mainCameraTarget);
    cameraTarget.copy(mainCameraTarget);
    welcomeOverlay.classList.add("is-hidden");
    vizUiElements.forEach((element) => element.classList.remove("is-hidden"));
}


export function welcomeStandbyAnimation(activeWorkers,scene,delta,controls) {
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
}

export function welcomeTransitionAnimation(activeWorkers,scene,delta, controls, camera) {
    if (!onGoingTransition) {
        onGoingTransition = true;
        scene.remove(welcomeWorker)
        startVisualizationTransition(camera,controls)
    }

    transitionTime += delta;
    const progress = Math.min(transitionTime / transitionDuration, 1);
    const easedProgress = smoothStep(progress);

    camera.position.lerpVectors(welcomeCameraPosition, mainCameraPosition, easedProgress);
    cameraTarget.lerpVectors(welcomeCameraTarget, mainCameraTarget, easedProgress);
    camera.lookAt(cameraTarget);

    if (progress >= 1) {
        finishVisualizationTransition(controls);
        onGoingTransition = false;
    }
    return onGoingTransition;
}


export async function setupWelcome(scene,camera,controls){
    welcomeWorker = new Worker();
    welcomeWorker.curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(49, 2.5, 27),
        new THREE.Vector3(43, 2.5, 32),
        new THREE.Vector3(36, 2.5, 36),
        new THREE.Vector3(28, 2.5, 37),
    ]);
    welcomeWorker.t = 0;
    await welcomeWorker.loadModel();
    welcomeWorker.scale.setScalar(1.15);
    onGoingTransition = false;

    scene.add(welcomeWorker);
    welcomeCameraLight = createWelcomeCameraLight();
    scene.add(welcomeCameraLight);

    camera.position.copy(welcomeCameraPosition);
    camera.lookAt(cameraTarget);

    controls.enabled = false;
    controls.target.copy(cameraTarget);

    applyCameraPose(camera,controls,welcomeCameraPosition, welcomeCameraTarget);

}
