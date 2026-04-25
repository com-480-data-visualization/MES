import * as THREE from "three";
import {updateInfo} from "../utils/infoPanel";
import { palette } from "../utils/palette.js";
export class Building extends THREE.Object3D {
    constructor(color = palette.building) {
        super();

        this.scale.setScalar(2.5);
        this.elapsed = 0;
        this.buildTime = 0;
        this.ready = false
        this.buildPieces = [];
        this.wallConfig = {
            brickWidth: 1.6,
            brickHeight: 0.55,
            brickDepth: 0.9,
            wallWidth: 7,
            wallDepth: 6,
            wallRows: 18
        };
        this.baseCoordinates = this.createBaseCoordinates();

        this.materials = {
            brick: new THREE.MeshBasicMaterial({ color: 0xb85f45 }),
            brickAlt: new THREE.MeshBasicMaterial({ color: 0xd07a55 }),
            mortar: new THREE.MeshBasicMaterial({ color: 0xe6d6c8 }),
            door: new THREE.MeshBasicMaterial({ color: 0x5b3524 }),
            roof: new THREE.MeshBasicMaterial({ color: 0x6f4428 }),
            window: new THREE.MeshBasicMaterial({ color }),
            glass: new THREE.MeshBasicMaterial({ color: 0x9dd7ff })
        };

        this.createHouse();
        this.setBuildProgress(0);
    }

    createHouse() {
        this.createFoundation();
        this.createWalls();
        this.createDetails();
        this.createFlatRoof();
    }

    createFoundation() {
        const foundationGeometry = new THREE.BoxGeometry(11.2, 0.25, 7);
        const foundation = new THREE.Mesh(foundationGeometry, this.materials.mortar);
        foundation.position.set(0, 0.125, 0);
        foundation.castShadow = true;
        this.addBuildPiece(foundation);
    }

    createWalls() {
        const {brickWidth, brickHeight, brickDepth, wallWidth, wallDepth, wallRows} = this.wallConfig;
        const startY = 0.45;
        const xStart = -((wallWidth - 1) * brickWidth) / 2;
        const zStart = -((wallDepth - 1) * brickDepth) / 2;
        const windowSlots = this.createRandomWindowSlots(wallRows, wallWidth, wallDepth);

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

            windowSlots
                .filter(slot => slot.row === row)
                .forEach(slot => {
                    const windowY = y + brickHeight * 0.15;

                    if (slot.face === "front") {
                        const x = xStart + slot.index * brickWidth + offset;
                        this.addWindow(x, windowY, -zStart + brickDepth * 0.58);
                    } else if (slot.face === "back") {
                        const x = xStart + slot.index * brickWidth + offset;
                        this.addWindow(x, windowY, zStart - brickDepth * 0.58, Math.PI);
                    } else if (slot.face === "left") {
                        const z = zStart + slot.index * brickDepth;
                        this.addWindow(xStart - brickDepth * 0.58, windowY, z, -Math.PI / 2);
                    } else if (slot.face === "right") {
                        const z = zStart + slot.index * brickDepth;
                        this.addWindow(-xStart + brickDepth * 0.58, windowY, z, Math.PI / 2);
                    }
                });
        }
    }

    createBaseCoordinates() {
        const {brickWidth, brickDepth, wallWidth, wallDepth} = this.wallConfig;
        const xStart = -((wallWidth - 1) * brickWidth) / 2;
        const zStart = -((wallDepth - 1) * brickDepth) / 2;
        const coordinates = [];

        for (let xIndex = 0; xIndex < wallWidth; xIndex++) {
            for (let zIndex = 0; zIndex < wallDepth; zIndex++) {
                coordinates.push({
                    x: xStart + xIndex * brickWidth,
                    y: zStart + zIndex * brickDepth
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

    createRandomWindowSlots(wallRows, wallWidth, wallDepth) {
        const slots = [];

        for (let row = 3; row < wallRows; row += 3) {
            for (let xIndex = 1; xIndex < wallWidth - 1; xIndex++) {
                const isDoorColumn = xIndex === Math.floor(wallWidth / 2);
                const isLowFrontRow = row < 6;

                if (!(isDoorColumn && isLowFrontRow) && Math.random() < 0.35) {
                    slots.push({ face: "front", row, index: xIndex });
                }

                if (Math.random() < 0.35) {
                    slots.push({ face: "back", row, index: xIndex });
                }
            }

            for (let zIndex = 1; zIndex < wallDepth - 1; zIndex++) {
                if (Math.random() < 0.3) {
                    slots.push({ face: "left", row, index: zIndex });
                }

                if (Math.random() < 0.3) {
                    slots.push({ face: "right", row, index: zIndex });
                }
            }
        }

        if (slots.length === 0) {
            slots.push({ face: "front", row: 6, index: 2 });
            slots.push({ face: "back", row: 9, index: wallWidth - 3 });
        }

        return slots;
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

    createDetails() {
        const door = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 2.2, 0.16),
            this.materials.door
        );
        door.position.set(0, 1.25, 2.86);
        this.addBuildPiece(door);
    }

    createFlatRoof() {
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(12.2, 0.35, 6.4),
            this.materials.roof
        );

        roof.position.set(0, 10.25, 0);
        roof.castShadow = true;
        this.addBuildPiece(roof);
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
        const normal = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
        glass.position.set(x + normal.x * 0.02, y, z + normal.z * 0.02);
        glass.rotation.y = rotationY;
        this.addBuildPiece(glass);
    }

    addBuildPiece(piece) {
        piece.visible = false;
        this.buildPieces.push(piece);
        this.add(piece);
    }

    update(delta) {
        if (!this.ready) return
        this.elapsed = Math.min(this.elapsed + delta, this.buildTime);
        this.setBuildProgress(this.elapsed / this.buildTime);
    }
    setDuration(duration) {
        this.buildTime = duration;
        this.ready = true;
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
