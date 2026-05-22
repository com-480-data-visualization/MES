import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {generatePath} from "../utils/pathGenerator";
import {renderInfo} from "../utils/infoPanel";
import { getNextRobotColor } from "../utils/palette.js";

const speed = 0.15
let selectedWorker = null;

export class Worker extends THREE.Object3D {
    constructor(baseCoordinates, committerID = "Unknown") {
        super();
        this.mode = 0
        this.t = 0
        this.buildingCenter = this.getBuildingCenter(baseCoordinates)
        this.committerID = committerID;
        this.color="#FFF"
        this.aura = null;
        this.auraTime = 0;

        this.loader = new GLTFLoader();
        this.url = "/MES/models/RobotExpressive.glb"
        //this.url = "models/r7v2.glb"

        this.curve = generatePath(baseCoordinates)

        this.c = 0

        this.modes = {
            "Dance": 0,
            "Death": 1,
            "Idle": 2,
            "Jump": 3,
            "No": 4,
            "Punch": 5,
            "Running": 6,
            "Sitting": 7,
            "Standing": 8,
            "ThumbsUp": 9,
            "Walking": 10,
            "WalkJump": 11,
            "Wave": 12,
            "Yes": 13,
            "work": 5,
            "goWork": 10,
            "returnWork": 6
        }

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
                        this.color = getNextRobotColor();
                        head.material.color.set(this.color); //make this random with color palette
                    }

                    this.model.scale.set(1, 1, 1);

                    this.add(this.model);
                    this.aura = this.createAura();
                    this.add(this.aura);

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
        this.updateAura(delta);

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

    createAura() {
        const aura = new THREE.Group();
        const color = new THREE.Color(this.color);

        const glowMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.14,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const glow = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 16), glowMaterial);
        glow.position.y = 1.05;
        glow.userData.baseOpacity = glowMaterial.opacity;
        glow.userData.baseScale = 1;
        aura.add(glow);

        const ringMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.72,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.035, 12, 96), ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.08;
        ring.userData.baseOpacity = ringMaterial.opacity;
        ring.userData.baseScale = 1;
        aura.add(ring);

        const waveMaterial = ringMaterial.clone();
        waveMaterial.opacity = 0.42;
        const wave = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.025, 12, 96), waveMaterial);
        wave.rotation.x = Math.PI / 2;
        wave.position.y = 0.1;
        wave.userData.baseOpacity = waveMaterial.opacity;
        wave.userData.baseScale = 1.25;
        aura.add(wave);

        aura.visible = false;
        return aura;
    }

    showAura() {
        if (!this.aura) return;

        this.aura.visible = true;
        this.auraTime = 0;
    }

    hideAura() {
        if (!this.aura) return;

        this.aura.visible = false;
    }

    updateAura(delta) {
        if (!this.aura?.visible) return;

        this.auraTime += delta;
        const pulse = (Math.sin(this.auraTime * 5) + 1) / 2;
        const wavePulse = (this.auraTime * 0.75) % 1;

        const [glow, ring, wave] = this.aura.children;
        glow.scale.setScalar(1 + pulse * 0.14);
        glow.material.opacity = glow.userData.baseOpacity * (0.7 + pulse * 0.45);

        ring.scale.setScalar(1 + pulse * 0.08);
        ring.material.opacity = ring.userData.baseOpacity * (0.72 + pulse * 0.28);

        wave.scale.setScalar(wave.userData.baseScale + wavePulse * 0.75);
        wave.material.opacity = wave.userData.baseOpacity * (1 - wavePulse);
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
            this.changeAnimation("Running")
        }
    }

    returnWork(delta) {
        this.t += speed * -delta;
        if (this.t <= 0){
            this.t = 0
            this.mode = 999
            this.changeAnimation("Walking")// 0
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
            this.changeAnimation("Punch")
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
        if (selectedWorker && selectedWorker !== this) {
            selectedWorker.hideAura();
        }

        selectedWorker = this;
        this.showAura();
        renderInfo(this.committerID)
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

    changeAnimation(name){
        const n = this.modes[name]

        const newClip = this.gltf.animations[n];
        const newAction = this.mixer.clipAction(newClip);
        this.mixer.stopAllAction();

        newAction.reset();
        newAction.play();
    }

    getMode(){
        return this.mode;
    }

    setMode(newMode){
        this.mode = newMode;
    }

}
