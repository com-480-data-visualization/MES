import * as THREE from "three";




export function generatePath(){
    const center =  {x:0,y:1,z:0}
    const theta_max = Math.random() * Math.PI * 2;
    const theta_min = (Math.random() * 2 - 1) * Math.PI/2 + theta_max;
    const r_min = 10
    const r_max = 50

    const start = new THREE.Vector3(
        center.x + r_max * Math.cos(theta_max),
        center.y,
        center.z + r_max * Math.sin(theta_max)
    )

    const end = new THREE.Vector3(
        center.x + r_min * Math.cos(theta_min),
        center.y,
        center.z + r_min * Math.sin(theta_min)
    )

    const middle = new THREE.Vector3().lerpVectors(start, end, 0.5);
    const offset = 50

    middle.x += (Math.random() - 0.5) * offset;
    middle.z += (Math.random() - 0.5) * offset;

    const points = [
        start,
        middle,
        end
    ];

    return new THREE.CatmullRomCurve3(points);


}



export function updateInfo(info){
    const container = document.getElementById('container');

    if (container.children.length > 1) {
        container.removeChild(container.lastChild);
    }

    const newBox = document.createElement('div');
    newBox.classList.add('box');
    newBox.textContent = info;

    container.appendChild(newBox);
}