import * as THREE from 'three';

export class Tile extends THREE.Object3D {
    constructor(size = 100, divisions = 10) {
        super();

        // Create the tile plane
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        this.add(plane);

        // Create the grid
        const gridHelper = new THREE.GridHelper(size, divisions);
        gridHelper.position.y = 0.01; // Slightly above the plane to avoid z-fighting
        this.add(gridHelper);
    }

    onClick(){
        // Placeholder for click functionality
        console.log("Tile clicked!");
    }
}