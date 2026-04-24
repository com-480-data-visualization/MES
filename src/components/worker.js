import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {generatePath, updateInfo} from "../utils/pathGenerator";
import { getNextRobotColor } from "../utils/palette.js";

const speed = 0.15

export class Worker extends THREE.Object3D {
    constructor(baseCoordinates) {
        super();
        this.mode = 0
        this.t = 0
        this.buildingCenter = this.getBuildingCenter(baseCoordinates)

        this.loader = new GLTFLoader();
        this.url = "/MES/models/RobotExpressive.glb"
        //this.url = "models/r7v2.glb"

        this.curve = generatePath(baseCoordinates)

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
                        head.material.color.set(getNextRobotColor()); //make this random with color palette
                    }

                    this.model.scale.set(1, 1, 1);

                    this.add(this.model);

                    const mixer = new THREE.AnimationMixer(this.model);
                    const clip = gltf.animations[10]; // pick an animation normal 6
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
            case 3:
                this.dance(delta)
                return;
            default:
                return;

        }
    }

    work(delta){
        if (this.mixer) {
            this.mixer.update(delta);
        }
        this.faceBuilding()
        this.c++
        if (this.c >= 1000){
            this.c = 0
            this.mode = 2
            this.changeAnimation(6)
        }
    }

    returnWork(delta) {
        this.t += speed * -delta;
        if (this.t <= 0){
            this.t = 0
            this.mode = 999
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

    dance(delta){
        if (this.mixer) {
            this.mixer.update(delta);
        }
        this.c++
        if (this.c >= 500){
            this.c = 0
            this.mode = 999
        }
    }

    onClick(){
        updateInfo("mamma mia a worker")
    }

    faceBuilding(){
        this.lookAt(new THREE.Vector3(this.buildingCenter.x, this.position.y, this.buildingCenter.z));
    }

    getBuildingCenter(baseCoordinates = []){
        if (baseCoordinates.length === 0) {
            return {x: 0, z: 0};
        }

        const bounds = baseCoordinates.reduce((bounds, coordinate) => {
            const z = coordinate.z ?? coordinate.y;

            return {
                minX: Math.min(bounds.minX, coordinate.x),
                maxX: Math.max(bounds.maxX, coordinate.x),
                minZ: Math.min(bounds.minZ, z),
                maxZ: Math.max(bounds.maxZ, z)
            };
        }, {
            minX: Infinity,
            maxX: -Infinity,
            minZ: Infinity,
            maxZ: -Infinity
        });

        return {
            x: (bounds.minX + bounds.maxX) / 2,
            z: (bounds.minZ + bounds.maxZ) / 2
        };
    }

    changeAnimation(n){

        const newClip = this.gltf.animations[n];
        const newAction = this.mixer.clipAction(newClip);
        this.mixer.stopAllAction();

        newAction.reset();
        newAction.play();
    }

    getMode(){
        return this.mode;
    }

}
