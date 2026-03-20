import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfffffff);

// Camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(3, 3, 5);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);



// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // smooth movement

// Resize handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Example points
const points = [
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(0, 5, 0),
    new THREE.Vector3(10, 0, 0),
    new THREE.Vector3(0, -5, 0),
    new THREE.Vector3(-10, 0, 0)
];

// Create a smooth curve
const curve = new THREE.CatmullRomCurve3(points);

const geometry2 = new THREE.BufferGeometry().setFromPoints(curve.getPoints(100));
const material2 = new THREE.LineBasicMaterial({ color: 0xff0000 });
const curveObject = new THREE.Line(geometry2, material2);
scene.add(curveObject);



let t = 0;       // progress along the path
let speed = 0.002; // adjust speed

function animate() {
    requestAnimationFrame(animate);

    t += speed;
    if (t > 1 || t < 0) speed *= -1; // reverse direction at ends

    const position = curve.getPoint(t);
    cube.position.copy(position);

    const tangent = curve.getTangent(t).normalize();
    cube.lookAt(cube.position.clone().add(tangent));

    controls.update();
    renderer.render(scene, camera);
}

animate();