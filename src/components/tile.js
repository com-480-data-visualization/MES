import * as THREE from 'three';
import { palette } from '../utils/palette.js';

export class Tile extends THREE.Object3D {
    constructor(size = 50, divisions = 10) {
        super();
        this.size = size;
        this.clock = 0;
        this.fireflyData = [];

        const geometry = new THREE.PlaneGeometry(size, size);
        this.floorMaterial = new THREE.MeshBasicMaterial({
            color: palette.floor,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(geometry, this.floorMaterial);
        plane.rotation.x = -Math.PI / 2;
        this.add(plane);

        this.gridHelper = new THREE.GridHelper(size, divisions, palette.grid, palette.grid);
        this.gridHelper.position.y = 0.01;
        this.add(this.gridHelper);

        this.fireflies = this.createFireflies();
        this.add(this.fireflies);

        this.updateColors();
    }

    createFireflies() {
        const group = new THREE.Group();
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(0), 3));

        const glowMaterial = new THREE.PointsMaterial({
            size: 14,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.24,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        group.add(new THREE.Points(geometry, glowMaterial));

        const coreMaterial = new THREE.PointsMaterial({
            size: 4,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.95,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        group.add(new THREE.Points(geometry, coreMaterial));

        group.userData.geometry = geometry;
        group.userData.glowMaterial = glowMaterial;
        group.userData.coreMaterial = coreMaterial;

        return group;
    }

    addFirefly() {
        const fireflyColor = new THREE.Color(palette.firefly);
        const color = fireflyColor.clone().lerp(new THREE.Color(0xffffff), Math.random() * 0.28);
        const center = this.getOpenGroundPoint();
        const half = this.size / 2 - 7;

        this.fireflyData.push({
            centerX: THREE.MathUtils.clamp(center.x, -half, half),
            centerZ: THREE.MathUtils.clamp(center.z, -half, half),
            radiusX: THREE.MathUtils.lerp(0.7, 2.8, Math.random()),
            radiusZ: THREE.MathUtils.lerp(0.7, 2.2, Math.random()),
            baseY: THREE.MathUtils.lerp(0.65, 2.6, Math.random()),
            bob: THREE.MathUtils.lerp(0.2, 0.85, Math.random()),
            phase: Math.random() * Math.PI * 2,
            speed: THREE.MathUtils.lerp(0.35, 0.95, Math.random()),
            drift: THREE.MathUtils.lerp(0.2, 0.55, Math.random()),
            color
        });

        this.syncFireflyGeometry();
        this.updateFireflies(this.clock);
    }

    resetFireflies() {
        this.fireflyData = [];
        this.syncFireflyGeometry();
    }

    syncFireflyGeometry() {
        const positions = new Float32Array(this.fireflyData.length * 3);
        const colors = new Float32Array(this.fireflyData.length * 3);

        this.fireflyData.forEach((firefly, index) => {
            positions[index * 3] = firefly.centerX;
            positions[index * 3 + 1] = firefly.baseY;
            positions[index * 3 + 2] = firefly.centerZ;
            colors[index * 3] = firefly.color.r;
            colors[index * 3 + 1] = firefly.color.g;
            colors[index * 3 + 2] = firefly.color.b;
        });

        this.fireflies.userData.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.fireflies.userData.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    getOpenGroundPoint(centerBuffer = 11) {
        const half = this.size / 2 - 2;
        let x = 0;
        let z = 0;

        for (let attempts = 0; attempts < 80; attempts++) {
            x = THREE.MathUtils.lerp(-half, half, Math.random());
            z = THREE.MathUtils.lerp(-half, half, Math.random());

            if (Math.abs(x) > centerBuffer || Math.abs(z) > centerBuffer) {
                return {x, z};
            }
        }

        return {x, z};
    }

    update(delta) {
        this.clock += delta;

        if (this.fireflies.visible) {
            this.updateFireflies(this.clock);
        }
    }

    updateFireflies(time, fireflies = this.fireflies) {
        const positions = fireflies.userData.geometry.getAttribute('position');
        const pulse = (Math.sin(time * 2.4) + 1) / 2;

        if (positions.count === 0) return;

        this.fireflyData.forEach((firefly, index) => {
            const orbit = time * firefly.speed + firefly.phase;
            const drift = time * firefly.drift + firefly.phase * 1.7;
            const x = firefly.centerX
                + Math.sin(orbit) * firefly.radiusX
                + Math.sin(drift * 0.7) * 0.35;
            const y = firefly.baseY
                + Math.sin(drift) * firefly.bob
                + Math.sin(time * 1.3 + firefly.phase) * 0.12;
            const z = firefly.centerZ
                + Math.cos(orbit * 0.82) * firefly.radiusZ
                + Math.cos(drift * 0.65) * 0.35;

            positions.setXYZ(index, x, y, z);
        });

        positions.needsUpdate = true;
        fireflies.userData.coreMaterial.opacity = 0.78 + pulse * 0.22;
        fireflies.userData.glowMaterial.opacity = 0.16 + pulse * 0.14;
    }

    updateColors() {
        this.floorMaterial.color.set(palette.floor);
        this.fireflies.visible = this.isEveningMode();

        const gridColors = this.gridHelper.geometry.getAttribute('color');
        if (!gridColors) return;

        const gridColor = new THREE.Color(palette.grid);
        for (let index = 0; index < gridColors.count; index++) {
            gridColors.setXYZ(index, gridColor.r, gridColor.g, gridColor.b);
        }
        gridColors.needsUpdate = true;
    }

    isEveningMode() {
        return document.documentElement.dataset.sceneTheme !== "day";
    }

    onClick(){
        // Placeholder for click functionality
        console.log("Tile clicked!");
    }
}
