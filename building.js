import * as THREE from "three";
import {updateInfo} from "./pathGenerator";
import { palette } from "./palette.js";
export class Building extends THREE.Object3D {
    constructor(color = palette.building) {
        super(); // call Object3D constructor

        // Add a body (cube)
        const bodyGeometry = new THREE.BoxGeometry(10, 10, 10);
        const bodyMaterial = new THREE.MeshBasicMaterial({color});
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.castShadow = true;

        // Add the body to this Object3D
        this.add(this.body);

    }

    // Example method to make the worker move
    upgrade(t) {
        if (t>=1){
            this.translateY(5)
            this.body.scale.y += 1
        }
    }

    onClick(){
        updateInfo("mamma mia a building")
    }
}