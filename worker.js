import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Worker extends THREE.Object3D {
    constructor() {
        super();

        this.loader = new GLTFLoader();
        this.url = "models/RobotExpressive.glb"

        const c_Lenght = 2;

        const points = [
            new THREE.Vector3(50, c_Lenght/2, 50),
            new THREE.Vector3(40, c_Lenght/2, 45),
            new THREE.Vector3(35, c_Lenght/2, 35),
            new THREE.Vector3(20, c_Lenght/2, 40),
            new THREE.Vector3(10, c_Lenght/2, 10),
            new THREE.Vector3(10, c_Lenght/2, 10),
            new THREE.Vector3(10, c_Lenght/2, 10),
            new THREE.Vector3(10, c_Lenght/2, 10)
        ];

        this.curve = new THREE.CatmullRomCurve3(points);

    }

    async loadModel() {
        return new Promise((resolve, reject) => {
            this.loader.load(
                this.url,
                (gltf) => {
                    this.model = gltf.scene;

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

    // Example method to make the worker move
    goWork(t,delta) {
        if (t < 0){
            t = 0
        }
        if (this.mixer) {
            this.mixer.update(delta);
        }

        const position = this.curve.getPoint(t);
        this.position.copy(position);

        const tangent = this.curve.getTangent(t).normalize();
        this.lookAt(this.position.clone().add(tangent));
    }

    onClick(){
        alert("mamma mia, a worker")
    }
}

