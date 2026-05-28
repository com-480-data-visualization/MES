import * as THREE from "three";
import {Building} from "./building";

const MIN_COMMITS_PER_BUILDING = 200;
const MAX_COMMITS_PER_BUILDING = 500;
const BUILDING_SPACING = 36;

export class City extends THREE.Object3D {
    constructor() {
        super();

        this.buildings = [];
        this.activeBuilding = null;
        this.totalCommits = 0;
        this.ready = false;
        this.currentCommitLimit = 0;
        this.pendingBuildingRollover = false;
    }

    setDuration(duration) {
        this.reset();
        this.totalCommits = duration;
        this.ready = true;
        this.startNewBuilding();
    }

    reset() {
        this.buildings.forEach((building) => {
            building.reset();
            this.remove(building);
        });

        this.buildings = [];
        this.activeBuilding = null;
        this.totalCommits = 0;
        this.ready = false;
        this.currentCommitLimit = 0;
        this.pendingBuildingRollover = false;
    }

    addCommits(commits = []) {
        if (!this.ready || commits.length === 0) return;

        commits.forEach((commit) => {
            const building = this.getBuildingForNextCommit();
            building.addCommits([commit]);

            if (building.commitCount >= this.currentCommitLimit) {
                building.completeRoof();
                this.pendingBuildingRollover = true;
            }
        });
    }

    completeRoof() {
        if (!this.activeBuilding || this.activeBuilding.commitCount === 0) return;

        this.activeBuilding.completeRoof();
    }

    getBaseCoordinates() {
        if (!this.activeBuilding) return [];

        return this.activeBuilding.getBaseCoordinates();
    }

    getBuildingForNextCommit() {
        if (!this.activeBuilding || this.pendingBuildingRollover) {
            this.startNewBuilding();
        }

        return this.activeBuilding;
    }

    startNewBuilding() {
        const building = new Building();
        const position = this.getBuildingPosition(this.buildings.length);

        building.position.set(position.x, 0, position.z);
        building.setDuration(this.totalCommits);

        this.add(building);
        this.buildings.push(building);
        this.activeBuilding = building;
        this.currentCommitLimit = this.getNextCommitLimit();
        this.pendingBuildingRollover = false;

        return building;
    }

    getNextCommitLimit() {
        return THREE.MathUtils.randInt(MIN_COMMITS_PER_BUILDING, MAX_COMMITS_PER_BUILDING);
    }

    getBuildingPosition(index) {
        let x = 0;
        let z = 0;
        let dx = 0;
        let dz = -1;

        for (let i = 0; i < index; i++) {
            if (x === z || (x < 0 && x === -z) || (x > 0 && x === 1 - z)) {
                const nextDx = -dz;
                dz = dx;
                dx = nextDx;
            }

            x += dx;
            z += dz;
        }

        return {
            x: x * BUILDING_SPACING,
            z: z * BUILDING_SPACING
        };
    }
}
