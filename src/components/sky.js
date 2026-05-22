import * as THREE from 'three';
import { palette } from '../utils/palette.js';

export class Sky extends THREE.Object3D {
    constructor() {
        super();

        this.skyMaterial = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            uniforms: {
                skyColor: { value: new THREE.Color(palette.sky) },
                voidColor: { value: new THREE.Color(palette.void) },
            },
            vertexShader: `
                    varying vec3 vPosition;

                    void main() {
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
            `,
            fragmentShader: `
                    uniform vec3 skyColor;
                    uniform vec3 voidColor;
                    varying vec3 vPosition;

                    void main() {
                        float height = normalize(vPosition).y;
                        float blend = smoothstep(-0.1, 0.45, height);
                        gl_FragColor = vec4(mix(voidColor, skyColor, blend), 1.0);
                    }
            `,
        });

        const sky = new THREE.Mesh(
            new THREE.SphereGeometry(500, 32, 16),
            this.skyMaterial
        );
        this.add(sky);

        this.stars = this.createStars();
        this.add(this.stars);

        // Create the sun
        const sun = new THREE.DirectionalLight(palette.sun, 1);
        sun.position.set(0, 100, 0);
        this.add(sun);

        this.updateColors();
    }

    createStars() {
        const starCount = 520;
        const radius = 430;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const brightStar = new THREE.Color(palette.star);
        const dimStar = new THREE.Color(palette.starDim);

        for (let i = 0; i < starCount; i++) {
            const phi = Math.random() * Math.PI * 2;
            const y = THREE.MathUtils.lerp(0.08, 0.98, Math.random());
            const horizontalRadius = Math.sqrt(1 - y * y);
            const flicker = Math.random();
            const color = dimStar.clone().lerp(brightStar, flicker);

            positions[i * 3] = Math.cos(phi) * horizontalRadius * radius;
            positions[i * 3 + 1] = y * radius;
            positions[i * 3 + 2] = Math.sin(phi) * horizontalRadius * radius;

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 2,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.9,
            vertexColors: true,
            depthWrite: false,
        });

        const stars = new THREE.Points(geometry, material);
        stars.renderOrder = 1;

        return stars;
    }

    isNightTheme() {
        return document.documentElement.dataset.sceneTheme !== "day";
    }

    updateColors() {
        this.skyMaterial.uniforms.skyColor.value.set(palette.sky);
        this.skyMaterial.uniforms.voidColor.value.set(palette.void);
        this.skyMaterial.uniformsNeedUpdate = true;

        if (this.stars) {
            this.stars.visible = this.isNightTheme();
        }
    }
}
