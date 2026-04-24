import * as THREE from 'three';
import { palette } from '../utils/palette.js';

export class Sky extends THREE.Object3D {
    constructor() {
        super();

        const sky = new THREE.Mesh(
            new THREE.SphereGeometry(500, 32, 16),
            new THREE.ShaderMaterial({
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
            })
        );
        this.add(sky);

        // Create the sun
        const sun = new THREE.DirectionalLight(palette.sun, 1);
        sun.position.set(100, 100, 100);
        this.add(sun);
    }
}
