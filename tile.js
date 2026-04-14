import * as THREE from 'three';
import { palette } from './palette.js';

export class Tile extends THREE.Object3D {
    constructor(size = 100, divisions = 10) {
        super();

        // Create the tile plane
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({ color: palette.floor, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        this.add(plane);

        // Create the grid
        const gridHelper = new THREE.GridHelper(size, divisions, palette.grid, palette.grid);
        gridHelper.position.y = 0.01; // Slightly above the plane to avoid z-fighting
        this.add(gridHelper);
    }

    onClick(){
        // Placeholder for click functionality
        console.log("Tile clicked!");
    }
}