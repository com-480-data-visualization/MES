import * as THREE from "three";
import {renderCommitInfo} from "../utils/infoPanel";
import {clearSelectedWorkerAura} from "./worker";
import { palette } from "../utils/palette.js";

export class Building extends THREE.Object3D {
    constructor(color = palette.building) {
        super();

        this.scale.setScalar(2.5);
        this.ready = false;
        this.totalCommits = 0;
        this.commitCount = 0;
        this.roofComplete = false;
        this.wallConfig = {
            blockWidth: 1.35,
            blockHeight: 0.72,
            blockDepth: 0.84,
            blockGap: 0.06,
            wallWidth: 7,
            wallDepth: 6,
            rowHeight: 0.82
        };
        this.baseCoordinates = this.createBaseCoordinates();
        this.dateColorMap = new Map();
        this.dateColors = [
            0x8c8c84,
            0x8b5a3c,
            0xb96c45,
            0xd48653,
            0x6d665b,
            0xa64e38,
            0xc79b64,
            0x7b6f57
        ];

        this.materials = {
            foundation: new THREE.MeshBasicMaterial({ color: 0xe6d6c8 }),
            roof: new THREE.MeshBasicMaterial({ color: 0x6f4428 }),
            roofGable: new THREE.MeshBasicMaterial({ color: 0x8f5632, side: THREE.DoubleSide }),
            roofTrim: new THREE.MeshBasicMaterial({ color: 0xf0d7be }),
            chimney: new THREE.MeshBasicMaterial({ color: 0x6b3a2e }),
            glass: new THREE.MeshBasicMaterial({ color: 0x7dd3fc }),
            windowFrame: new THREE.MeshBasicMaterial({ color: 0x050505 }),
            grid: new THREE.LineBasicMaterial({ color: 0x050505 })
        };

        this.commitBlockGroup = new THREE.Group();
        this.roofGroup = new THREE.Group();

        this.createFoundation();
        this.add(this.commitBlockGroup);
        this.add(this.roofGroup);
    }

    createFoundation() {
        const {blockWidth, blockDepth} = this.wallConfig;
        const {xStart, xEnd, zStart, zEnd} = this.getFootprintMetrics();
        const foundationGeometry = new THREE.BoxGeometry(
            xEnd - xStart + blockWidth + 1.5,
            0.25,
            zEnd - zStart + blockDepth + 1.2
        );

        this.foundation = new THREE.Mesh(foundationGeometry, this.materials.foundation);
        this.foundation.position.set(0, 0.125, 0);
        this.foundation.castShadow = true;
        this.foundation.visible = false;
        this.add(this.foundation);
    }

    createBaseCoordinates() {
        const {wallWidth, wallDepth} = this.wallConfig;
        const {xStart, zStart, xStep, zEnd} = this.getFootprintMetrics();
        const zStep = wallDepth > 1 ? (zEnd - zStart) / (wallDepth - 1) : 0;
        const coordinates = [];

        for (let xIndex = 0; xIndex < wallWidth; xIndex++) {
            for (let zIndex = 0; zIndex < wallDepth; zIndex++) {
                coordinates.push({
                    x: xStart + xIndex * xStep,
                    y: zStart + zIndex * zStep
                });
            }
        }

        return coordinates;
    }

    getBaseCoordinates() {
        return this.baseCoordinates.map(coordinate => ({
            x: this.position.x + coordinate.x * this.scale.x,
            y: this.position.z + coordinate.y * this.scale.z
        }));
    }

    getSlotsPerRow() {
        const {wallWidth, wallDepth} = this.wallConfig;
        return wallWidth * 2 + Math.max(0, wallDepth - 2) * 2;
    }

    getFootprintMetrics() {
        const {blockWidth, blockDepth, blockGap, wallWidth, wallDepth} = this.wallConfig;
        const sideSlots = Math.max(0, wallDepth - 2);
        const xStep = blockWidth + blockGap;
        const sideStep = blockWidth + blockGap;
        const cornerClearance = (blockDepth + blockWidth) / 2 + blockGap;
        const halfWidth = ((wallWidth - 1) * xStep) / 2;
        const halfDepth = sideSlots > 0
            ? (cornerClearance * 2 + (sideSlots - 1) * sideStep) / 2
            : blockDepth / 2;

        return {
            xStart: -halfWidth,
            xEnd: halfWidth,
            zStart: -halfDepth,
            zEnd: halfDepth,
            xStep,
            sideStep,
            sideSlots,
            cornerClearance
        };
    }

    getCommitSlot(index) {
        const {wallWidth} = this.wallConfig;
        const {xStart, xEnd, zStart, zEnd, xStep, sideStep, sideSlots, cornerClearance} = this.getFootprintMetrics();
        const slotsPerRow = this.getSlotsPerRow();
        const row = Math.floor(index / slotsPerRow);
        let slotIndex = index % slotsPerRow;

        if (slotIndex < wallWidth) {
            return {
                row,
                x: xStart + slotIndex * xStep,
                z: zEnd,
                rotationY: 0,
                normal: new THREE.Vector3(0, 0, 1)
            };
        }

        slotIndex -= wallWidth;

        if (slotIndex < sideSlots) {
            return {
                row,
                x: xEnd,
                z: zEnd - cornerClearance - slotIndex * sideStep,
                rotationY: Math.PI / 2,
                normal: new THREE.Vector3(1, 0, 0)
            };
        }

        slotIndex -= sideSlots;

        if (slotIndex < wallWidth) {
            return {
                row,
                x: xEnd - slotIndex * xStep,
                z: zStart,
                rotationY: 0,
                normal: new THREE.Vector3(0, 0, -1)
            };
        }

        slotIndex -= wallWidth;

        return {
            row,
            x: xStart,
            z: zStart + cornerClearance + slotIndex * sideStep,
            rotationY: Math.PI / 2,
            normal: new THREE.Vector3(-1, 0, 0)
        };
    }

    getCommitDateKey(commit) {
        if (!commit.date) return "unknown";

        const date = new Date(commit.date);
        if (Number.isNaN(+date)) return "unknown";

        return date.toISOString().slice(0, 10);
    }

    getCommitColor(commit) {
        const dateKey = this.getCommitDateKey(commit);

        if (!this.dateColorMap.has(dateKey)) {
            const colorIndex = this.dateColorMap.size % this.dateColors.length;
            this.dateColorMap.set(dateKey, this.dateColors[colorIndex]);
        }

        return new THREE.Color(this.dateColorMap.get(dateKey));
    }

    hashCommit(commit) {
        const value = `${commit.sha || ""}${commit.date || ""}${commit.message || ""}`;
        let hash = 0;

        for (let i = 0; i < value.length; i++) {
            hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
        }

        return hash;
    }

    isWindowCommit(commit, index) {
        return index > 2 && (index % 7 === 3 || this.hashCommit(commit) % 13 === 0);
    }

    addCommits(commits = []) {
        if (!this.ready || commits.length === 0) return;

        commits.forEach((commit) => this.addCommitBlock(commit));
    }

    addCommitBlock(commit) {
        const slot = this.getCommitSlot(this.commitCount);
        const {blockWidth, blockHeight, blockDepth} = this.wallConfig;
        const isWindow = this.isWindowCommit(commit, this.commitCount);
        const blockMaterial = new THREE.MeshBasicMaterial({ color: this.getCommitColor(commit) });
        blockMaterial.userData.disposable = true;
        const blockGeometry = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);
        const block = new THREE.Mesh(
            blockGeometry,
            blockMaterial
        );
        const group = new THREE.Group();

        block.position.set(
            slot.x,
            0.36 + slot.row * this.wallConfig.rowHeight + blockHeight / 2,
            slot.z
        );
        block.rotation.y = slot.rotationY;
        block.castShadow = true;
        block.add(this.createBlockEdges(blockGeometry));
        group.add(block);

        if (isWindow) {
            this.addWindowFace(group, block.position, slot.normal, slot.rotationY);
        }

        commit.buildingBlockType = isWindow ? "window" : "block";
        commit.buildingDateKey = this.getCommitDateKey(commit);
        block.userData.commit = commit;
        group.userData.commit = commit;
        group.onClick = () => {
            clearSelectedWorkerAura();
            renderCommitInfo(commit);
        };

        this.commitBlockGroup.add(group);
        this.commitCount++;
        this.roofComplete = false;
    }

    createBlockEdges(geometry) {
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry),
            this.materials.grid
        );
        edges.renderOrder = 3;
        return edges;
    }

    addWindowFace(group, blockPosition, normal, rotationY) {
        const {blockWidth, blockHeight, blockDepth} = this.wallConfig;
        const faceOffset = blockDepth / 2 + 0.026;
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(blockWidth * 0.56, blockHeight * 0.58, 0.045),
            this.materials.windowFrame
        );
        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(blockWidth * 0.42, blockHeight * 0.42, 0.055),
            this.materials.glass
        );
        const facePosition = blockPosition.clone().add(normal.clone().multiplyScalar(faceOffset));

        frame.position.copy(facePosition);
        glass.position.copy(facePosition.clone().add(normal.clone().multiplyScalar(0.018)));
        frame.rotation.y = rotationY;
        glass.rotation.y = rotationY;
        group.add(frame);
        group.add(glass);
    }

    createFinalRoof(baseY) {
        const {blockWidth, blockDepth} = this.wallConfig;
        const {xStart, xEnd, zStart, zEnd} = this.getFootprintMetrics();
        const roofWidth = xEnd - xStart + blockWidth + 2.1;
        const roofDepth = zEnd - zStart + blockDepth + 1.4;
        const roofAngle = Math.PI / 7;
        const roofPanelDepth = roofDepth / 2 + 0.55;
        const roofZ = roofPanelDepth * 0.26;

        const leftRoof = new THREE.Mesh(
            new THREE.BoxGeometry(roofWidth, 0.34, roofPanelDepth),
            this.materials.roof
        );
        leftRoof.position.set(0, baseY + 0.62, -roofZ);
        leftRoof.rotation.x = -roofAngle;
        leftRoof.castShadow = true;
        this.roofGroup.add(leftRoof);

        const rightRoof = leftRoof.clone();
        rightRoof.position.z = roofZ;
        rightRoof.rotation.x = roofAngle;
        this.roofGroup.add(rightRoof);

        const ridge = new THREE.Mesh(
            new THREE.BoxGeometry(roofWidth + 0.15, 0.25, 0.28),
            this.materials.roofTrim
        );
        ridge.position.set(0, baseY + 1.34, 0);
        ridge.castShadow = true;
        this.roofGroup.add(ridge);

        this.addRoofGable(zStart - blockDepth / 2 - 0.48, baseY, roofWidth);
        this.addRoofGable(zEnd + blockDepth / 2 + 0.48, baseY, roofWidth);

        const chimney = new THREE.Mesh(
            new THREE.BoxGeometry(0.62, 1.18, 0.54),
            this.materials.chimney
        );
        chimney.position.set(roofWidth * 0.26, baseY + 1.35, -roofZ * 0.62);
        chimney.rotation.x = -roofAngle;
        chimney.castShadow = true;
        this.roofGroup.add(chimney);
    }

    addRoofGable(z, baseY, roofWidth) {
        const halfWidth = roofWidth * 0.46;
        const gableShape = new THREE.Shape();
        gableShape.moveTo(-halfWidth, 0);
        gableShape.lineTo(halfWidth, 0);
        gableShape.lineTo(0, 1.55);
        gableShape.lineTo(-halfWidth, 0);

        const gable = new THREE.Mesh(
            new THREE.ShapeGeometry(gableShape),
            this.materials.roofGable
        );
        gable.position.set(0, baseY - 0.08, z);
        gable.castShadow = true;
        this.roofGroup.add(gable);
    }

    getRoofBaseY() {
        const rows = Math.max(1, Math.ceil(Math.max(1, this.commitCount) / this.getSlotsPerRow()));
        return 0.48 + rows * this.wallConfig.rowHeight;
    }

    clearGroup(group) {
        while (group.children.length > 0) {
            const child = group.children[0];
            group.remove(child);
            this.disposeObject(child);
        }
    }

    disposeObject(object) {
        object.traverse((child) => {
            child.geometry?.dispose();

            if (Array.isArray(child.material)) {
                child.material.forEach((material) => {
                    if (material.userData?.disposable) {
                        material.dispose?.();
                    }
                });
            } else if (child.material?.userData?.disposable) {
                child.material.dispose?.();
            }
        });
    }

    update() {
        return;
    }

    setDuration(duration) {
        this.reset();
        this.totalCommits = duration;
        this.ready = true;
        this.foundation.visible = true;
    }

    reset() {
        this.ready = false;
        this.totalCommits = 0;
        this.commitCount = 0;
        this.roofComplete = false;
        this.dateColorMap.clear();
        this.foundation.visible = false;
        this.clearGroup(this.commitBlockGroup);
        this.clearGroup(this.roofGroup);
    }

    setBuildProgress() {
        return;
    }

    upgrade() {
        return;
    }

    completeRoof() {
        if (this.roofComplete || !this.ready) return;

        this.foundation.visible = true;
        this.clearGroup(this.roofGroup);
        this.createFinalRoof(this.getRoofBaseY());
        this.roofComplete = true;
    }

    onClick() {
        return;
    }
}
