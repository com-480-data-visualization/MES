import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {generatePath} from "./pathGenerator";

const speed = 0.15

export class Worker extends THREE.Object3D {
    constructor() {
        super();
        this.mode = 0
        this.t = 0

        this.loader = new GLTFLoader();
        this.url = "models/RobotExpressive.glb"

        this.curve = generatePath()

        this.c = 0

    }

    async loadModel() {
        return new Promise((resolve, reject) => {
            this.loader.load(
                this.url,
                (gltf) => {
                    this.model = gltf.scene;
                    this.gltf = gltf

                    const head = this.model.getObjectByName('Head_3'); // depends on model!

                    if (head) {
                        head.material.color.set(0xff0000); //make this random with color palette
                    }


                    this.add(this.model);

                    const mixer = new THREE.AnimationMixer(this.model);
                    const clip = gltf.animations[6]; // pick an animation
                    const action = mixer.clipAction(clip);
                    action.play();

                    // store mixer for update loop
                    this.mixer = mixer;
                    resolve(this);

                },
                undefined,
                reject
            );
        });
    }

    update(delta) {
        switch (this.mode) {
            case 0:
                this.goWork(delta)
                return;
            case 1:
                this.work(delta)
                return;
            case 2:
                this.returnWork(delta)
                return;
            default:
                return;

        }
    }

    work(delta){
        if (this.mixer) {
            this.mixer.update(delta);
        }
        this.c++
        if (this.c >= 100){
            this.c = 0
            this.mode = 2
            this.changeAnimation(6)
        }
    }

    returnWork(delta) {
        this.t += speed * -delta;
        if (this.t <= 0){
            this.t = 0
            this.mode = 3
            this.changeAnimation(0)
        }

        if (this.mixer) {
            this.mixer.update(delta);
        }

        const position = this.curve.getPoint(this.t);
        this.position.copy(position);

        const tangent = this.curve.getTangent(this.t).normalize().multiplyScalar(-1);
        this.lookAt(this.position.clone().add(tangent));
    }

    goWork(delta) {
        this.t += speed * delta;
        if (this.t >= 1){
            this.t = 1
            this.mode = 1
            this.changeAnimation(5)
        }

        if (this.mixer) {
            this.mixer.update(delta);
        }

        const position = this.curve.getPoint(this.t);
        this.position.copy(position);

        const tangent = this.curve.getTangent(this.t).normalize();
        this.lookAt(this.position.clone().add(tangent));
    }

    onClick(){
        alert("mamma mia, a worker")
    }

    changeAnimation(n){

        const newClip = this.gltf.animations[n];
        const newAction = this.mixer.clipAction(newClip);
        this.mixer.stopAllAction();

        newAction.reset();
        newAction.play();
    }

}

