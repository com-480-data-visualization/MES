import * as THREE from "three";
import {updateInfo} from "../utils/pathGenerator";
import { palette } from "../utils/palette.js";
export class Building extends THREE.Object3D {
    constructor(color = palette.building) {
        super();

        this.elapsed = 0;
        this.buildTime = 18;
        this.buildPieces = [];

        this.materials = {
            brick: new THREE.MeshBasicMaterial({ color: 0xb85f45 }),
            brickAlt: new THREE.MeshBasicMaterial({ color: 0xd07a55 }),
            mortar: new THREE.MeshBasicMaterial({ color: 0xe6d6c8 }),
            roof: new THREE.MeshBasicMaterial({ color: 0x7f2f2a }),
            roofEdge: new THREE.MeshBasicMaterial({ color: 0x5f211d }),
            door: new THREE.MeshBasicMaterial({ color: 0x5b3524 }),
            window: new THREE.MeshBasicMaterial({ color }),
            glass: new THREE.MeshBasicMaterial({ color: 0x9dd7ff })
        };

        this.createHouse();
        this.setBuildProgress(0);
    }

    createHouse() {
        this.createFoundation();
        this.createWalls();
        this.createRoof();
        this.createDetails();
    }

    createFoundation() {
        const foundationGeometry = new THREE.BoxGeometry(11.2, 0.25, 7);
        const foundation = new THREE.Mesh(foundationGeometry, this.materials.mortar);
        foundation.position.set(0, 0.125, 0);
        foundation.castShadow = true;
        this.addBuildPiece(foundation);
    }

    createWalls() {
        const brickWidth = 1.6;
        const brickHeight = 0.55;
        const brickDepth = 0.9;
        const wallWidth = 6;
        const wallDepth = 5;
        const wallRows = 8;
        const startY = 0.45;
        const xStart = -((wallWidth - 1) * brickWidth) / 2;
        const zStart = -((wallDepth - 1) * brickDepth) / 2;

        for (let row = 0; row < wallRows; row++) {
            const y = startY + row * brickHeight;
            const offset = row % 2 === 0 ? 0 : brickWidth * 0.25;

            for (let xIndex = 0; xIndex < wallWidth; xIndex++) {
                const x = xStart + xIndex * brickWidth + offset;

                this.addBrick(x, y, zStart, brickWidth, brickHeight, brickDepth, row, xIndex);
                this.addBrick(x, y, -zStart, brickWidth, brickHeight, brickDepth, row, xIndex + wallWidth);
            }

            for (let zIndex = 1; zIndex < wallDepth - 1; zIndex++) {
                const z = zStart + zIndex * brickDepth;

                this.addBrick(xStart, y, z, brickDepth, brickHeight, brickWidth, row, zIndex, Math.PI / 2);
                this.addBrick(-xStart, y, z, brickDepth, brickHeight, brickWidth, row, zIndex + wallDepth, Math.PI / 2);
            }
        }
    }

    addBrick(x, y, z, width, height, depth, row, index, rotationY = 0) {
        const geometry = new THREE.BoxGeometry(width * 0.94, height * 0.9, depth * 0.94);
        const material = (row + index) % 2 === 0 ? this.materials.brick : this.materials.brickAlt;
        const brick = new THREE.Mesh(geometry, material);

        brick.position.set(x, y, z);
        brick.rotation.y = rotationY;
        brick.castShadow = true;

        this.addBuildPiece(brick);
    }

    createRoof() {
        const roofLength = 6.6;
        const roofTileWidth = 1.3;
        const roofTileDepth = 1.05;
        const roofTileHeight = 0.28;
        const roofRows = 4;
        const roofColumns = 6;
        const roofAngle = Math.PI / 5;
        const roofY = 5.25;
        const zStart = -((roofColumns - 1) * roofTileDepth) / 2;

        for (let row = 0; row < roofRows; row++) {
            for (let column = 0; column < roofColumns; column++) {
                const z = zStart + column * roofTileDepth;
                const xOffset = 1.3 + row * 0.72;
                const y = roofY + row * 0.42;

                this.addRoofTile(-xOffset, y, z, roofTileWidth, roofTileHeight, roofTileDepth, roofAngle);
                this.addRoofTile(xOffset, y, z, roofTileWidth, roofTileHeight, roofTileDepth, -roofAngle);
            }
        }

        const ridgeGeometry = new THREE.BoxGeometry(0.45, 0.35, roofLength);
        const ridge = new THREE.Mesh(ridgeGeometry, this.materials.roofEdge);
        ridge.position.set(0, roofY + 1.55, 0);
        ridge.castShadow = true;
        this.addBuildPiece(ridge);
    }

    addRoofTile(x, y, z, width, height, depth, rotationZ) {
        const tile = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            this.materials.roof
        );

        tile.position.set(x, y, z);
        tile.rotation.z = rotationZ;
        tile.castShadow = true;

        this.addBuildPiece(tile);
    }

    createDetails() {
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2.2, 0.16),
            this.materials.door
        );
        door.position.set(0, 1.25, 2.33);
        this.addBuildPiece(door);

        this.addWindow(-2.7, 2.8, 2.34);
        this.addWindow(2.7, 2.8, 2.34);
        this.addWindow(-4.2, 2.8, 0, Math.PI / 2);
        this.addWindow(4.2, 2.8, 0, Math.PI / 2);

        const chimney = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.7, 0.8),
            this.materials.brick
        );
        chimney.position.set(2.2, 6.15, -1.6);
        chimney.castShadow = true;
        this.addBuildPiece(chimney);
    }

    addWindow(x, y, z, rotationY = 0) {
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.35, 1.25, 0.16),
            this.materials.window
        );
        frame.position.set(x, y, z);
        frame.rotation.y = rotationY;
        this.addBuildPiece(frame);

        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(0.95, 0.85, 0.18),
            this.materials.glass
        );
        glass.position.set(x, y, z + (rotationY === 0 ? 0.02 : 0));
        glass.rotation.y = rotationY;
        this.addBuildPiece(glass);
    }

    addBuildPiece(piece) {
        piece.visible = false;
        this.buildPieces.push(piece);
        this.add(piece);
    }

    update(delta) {
        this.elapsed = Math.min(this.elapsed + delta, this.buildTime);
        this.setBuildProgress(this.elapsed / this.buildTime);
    }

    setBuildProgress(progress) {
        const visiblePieces = Math.floor(progress * this.buildPieces.length);

        this.buildPieces.forEach((piece, index) => {
            piece.visible = index < visiblePieces;
        });
    }

    upgrade(t) {
        this.setBuildProgress(THREE.MathUtils.clamp(t, 0, 1));
    }

    onClick() {
        updateInfo("This house is built brick by brick over time.");
    }
}
