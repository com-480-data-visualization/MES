import * as THREE from 'three';
import { palette } from '../utils/palette.js';

export class Tile extends THREE.Object3D {
    constructor(size = 100, divisions = 10) {
        super();

        // Create the tile plane
        const geometry = new THREE.PlaneGeometry(size, size);
        this.floorMaterial = new THREE.MeshBasicMaterial({ color: palette.floor, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, this.floorMaterial);
        plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        this.add(plane);

        // Create the grid
        this.gridHelper = new THREE.GridHelper(size, divisions, palette.grid, palette.grid);
        this.gridHelper.position.y = 0.01; // Slightly above the plane to avoid z-fighting
        this.add(this.gridHelper);
    }

    updateColors() {
        this.floorMaterial.color.set(palette.floor);

        const gridColors = this.gridHelper.geometry.getAttribute('color');
        if (!gridColors) return;

        const gridColor = new THREE.Color(palette.grid);
        for (let index = 0; index < gridColors.count; index++) {
            gridColors.setXYZ(index, gridColor.r, gridColor.g, gridColor.b);
        }
        gridColors.needsUpdate = true;
    }

    onClick(){
        // Placeholder for click functionality
        console.log("Tile clicked!");
    }
}
