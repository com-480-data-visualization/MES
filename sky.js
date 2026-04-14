import * as THREE from 'three';
import { Sky as ThreeSky } from 'three/examples/jsm/objects/Sky.js';

export class Sky extends THREE.Object3D {
    constructor() {
        super();

        // Create the sky
        const sky = new ThreeSky();
        sky.scale.setScalar(450000);
        this.add(sky);

        // Configure sky uniforms
        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = 10;
        uniforms['rayleigh'].value = 2;
        uniforms['mieCoefficient'].value = 0.005;
        uniforms['mieDirectionalG'].value = 0.8;

        // Create the sun
        const sun = new THREE.DirectionalLight(0xffffff, 1);
        sun.position.set(100, 100, 100);
        this.add(sun);

        // Link sun position to sky material
        sky.material.uniforms['sunPosition'].value.copy(sun.position);
    }
}
