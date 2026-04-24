import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls";


export function createScene(){
    return new THREE.Scene();
}

export function createCamera(){

    // Camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    return camera;
}

export function createRenderer(){
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
}

export function createOrbitControls(camera,renderer){
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // smooth movement
    controls.minDistance = 30
    controls.maxDistance = 200

    return controls;
}