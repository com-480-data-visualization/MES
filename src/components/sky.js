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
                sunsetHorizonColor: { value: new THREE.Color(palette.sunsetHorizon) },
                sunsetGlowColor: { value: new THREE.Color(palette.sunsetGlow) },
                sunsetRoseColor: { value: new THREE.Color(palette.sunsetRose) },
                sunsetVioletColor: { value: new THREE.Color(palette.sunsetViolet) },
                sunsetCloudColor: { value: new THREE.Color(palette.sunsetCloud) },
                sunsetStrength: { value: 0 },
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
                    uniform vec3 sunsetHorizonColor;
                    uniform vec3 sunsetGlowColor;
                    uniform vec3 sunsetRoseColor;
                    uniform vec3 sunsetVioletColor;
                    uniform vec3 sunsetCloudColor;
                    uniform float sunsetStrength;
                    varying vec3 vPosition;

                    float stripeBand(float height, float center, float width) {
                        return 1.0 - smoothstep(width * 0.35, width, abs(height - center));
                    }

                    void main() {
                        vec3 direction = normalize(vPosition);
                        float height = direction.y;
                        float blend = smoothstep(-0.1, 0.45, height);
                        vec3 baseColor = mix(voidColor, skyColor, blend);

                        float horizonGlow = 1.0 - smoothstep(0.0, 0.36, abs(height - 0.02));
                        vec3 sunsetColor = mix(sunsetGlowColor, sunsetHorizonColor, smoothstep(-0.12, 0.1, height));
                        sunsetColor = mix(sunsetColor, sunsetRoseColor, smoothstep(0.08, 0.34, height));
                        sunsetColor = mix(sunsetColor, sunsetVioletColor, smoothstep(0.32, 0.76, height));
                        sunsetColor = mix(sunsetColor, skyColor, smoothstep(0.72, 1.0, height));

                        vec3 sunDirection = normalize(vec3(-0.5, 0.02, -0.86));
                        float sunDot = max(dot(direction, sunDirection), 0.0);
                        float sunDisc = smoothstep(0.9992, 1.0, sunDot);
                        float sunGlow = pow(sunDot, 12.0) * horizonGlow;
                        sunsetColor = mix(sunsetColor, sunsetGlowColor, min(horizonGlow * 0.34 + sunGlow * 0.55, 0.72));
                        sunsetColor = mix(sunsetColor, vec3(1.0, 0.8, 0.24), sunDisc);

                        float wispA = sin(direction.x * 18.0 + direction.z * 5.5 + height * 30.0) * 0.5 + 0.5;
                        float wispB = sin(direction.x * 35.0 - direction.z * 9.0 + height * 14.0) * 0.5 + 0.5;
                        float cloudTexture = smoothstep(0.58, 0.92, mix(wispA, wispB, 0.35));
                        float cloudBands = stripeBand(height, 0.16, 0.08) * 0.85 + stripeBand(height, 0.31, 0.1) * 0.48;
                        float cloudFade = smoothstep(-0.03, 0.08, height) * (1.0 - smoothstep(0.56, 0.86, height));
                        float cloudMask = cloudTexture * cloudBands * cloudFade;
                        sunsetColor = mix(sunsetColor, sunsetCloudColor, cloudMask * 0.52);

                        gl_FragColor = vec4(mix(baseColor, sunsetColor, sunsetStrength), 1.0);
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

        this.sunSprite = this.createSunSprite();
        this.add(this.sunSprite);

        this.moonSprite = this.createMoonSprite();
        this.add(this.moonSprite);

        // Directional light for the scene.
        this.sun = new THREE.DirectionalLight(palette.sun, 1);
        this.sun.position.set(0, 100, 0);
        this.add(this.sun);

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

    createSunTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;

        const context = canvas.getContext('2d');
        const glow = context.createRadialGradient(64, 64, 8, 64, 64, 63);
        glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        glow.addColorStop(0.36, 'rgba(255, 255, 255, 0.95)');
        glow.addColorStop(0.58, 'rgba(255, 255, 255, 0.28)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.fillStyle = glow;
        context.fillRect(0, 0, 128, 128);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    createMoonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;

        const context = canvas.getContext('2d');
        const glow = context.createRadialGradient(64, 64, 18, 64, 64, 60);
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        glow.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, 128, 128);

        context.beginPath();
        context.arc(58, 60, 28, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 255, 255, 0.98)';
        context.fill();

        context.globalCompositeOperation = 'destination-out';
        context.beginPath();
        context.arc(70, 54, 27, 0, Math.PI * 2);
        context.fill();
        context.globalCompositeOperation = 'source-over';

        context.beginPath();
        context.arc(47, 50, 3, 0, Math.PI * 2);
        context.arc(54, 76, 2, 0, Math.PI * 2);
        context.arc(39, 66, 2.5, 0, Math.PI * 2);
        context.fillStyle = 'rgba(190, 210, 235, 0.32)';
        context.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    createSunSprite() {
        const material = new THREE.SpriteMaterial({
            map: this.createSunTexture(),
            color: palette.sun,
            transparent: true,
            opacity: 0.94,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(-250, 115, -310);
        sprite.scale.set(54, 54, 1);
        sprite.renderOrder = 2;
        return sprite;
    }

    createMoonSprite() {
        const material = new THREE.SpriteMaterial({
            map: this.createMoonTexture(),
            color: palette.moon,
            transparent: true,
            opacity: 0.92,
            depthWrite: false,
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(-140, 125, -360);
        sprite.scale.set(46, 46, 1);
        sprite.renderOrder = 2;
        return sprite;
    }

    isMorningTheme() {
        const theme = document.documentElement.dataset.sceneTheme;
        return theme === "morning" || theme === "day";
    }

    isEveningTheme() {
        const theme = document.documentElement.dataset.sceneTheme;
        return theme === "evening" || theme === "night";
    }

    isAfternoonTheme() {
        return document.documentElement.dataset.sceneTheme === "afternoon";
    }

    updateColors() {
        this.skyMaterial.uniforms.skyColor.value.set(palette.sky);
        this.skyMaterial.uniforms.voidColor.value.set(palette.void);
        this.skyMaterial.uniforms.sunsetHorizonColor.value.set(palette.sunsetHorizon);
        this.skyMaterial.uniforms.sunsetGlowColor.value.set(palette.sunsetGlow);
        this.skyMaterial.uniforms.sunsetRoseColor.value.set(palette.sunsetRose);
        this.skyMaterial.uniforms.sunsetVioletColor.value.set(palette.sunsetViolet);
        this.skyMaterial.uniforms.sunsetCloudColor.value.set(palette.sunsetCloud);
        this.skyMaterial.uniforms.sunsetStrength.value = this.isAfternoonTheme() ? 1 : 0;
        this.skyMaterial.uniformsNeedUpdate = true;

        if (this.sun) {
            this.sun.color.set(palette.sun);
        }

        if (this.sunSprite) {
            this.sunSprite.visible = this.isMorningTheme();
            this.sunSprite.material.color.set(palette.sun);
        }

        if (this.moonSprite) {
            this.moonSprite.visible = this.isEveningTheme();
            this.moonSprite.material.color.set(palette.moon);
        }

        if (this.stars) {
            this.stars.visible = this.isEveningTheme();
        }
    }
}
