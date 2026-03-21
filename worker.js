import * as THREE from "three";
export class Worker extends THREE.Object3D {
    constructor(color = 0x00ff00) {
        super(); // call Object3D constructor

        // Add a body (cube)
        const bodyGeometry = new THREE.BoxGeometry(1, 2, 1);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.castShadow = true;

        // Add the body to this Object3D
        this.add(this.body);

        // Optional: add a head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.5; // on top of the body
        this.head.castShadow = true;
        this.add(this.head);


        const c_Lenght = 2
        //work path
        const points = [
            new THREE.Vector3(50, c_Lenght/2, 50),
            new THREE.Vector3(40, c_Lenght/2, 45),
            new THREE.Vector3(35, c_Lenght/2, 35),
            new THREE.Vector3(20, c_Lenght/2, 40),
            new THREE.Vector3(10, c_Lenght/2, 10),
            new THREE.Vector3(10, c_Lenght/2, 10),
            new THREE.Vector3(10, c_Lenght/2, 10),
            new THREE.Vector3(10, c_Lenght/2, 10)
        ];

        // Create a smooth curve
        this.curve = new THREE.CatmullRomCurve3(points);


    }

    // Example method to make the worker move
    goWork(t) {
        if (t < 0){
            t = 0
        }
        const position = this.curve.getPoint(t);
        this.position.copy(position);

        const tangent = this.curve.getTangent(t).normalize();
        this.lookAt(this.position.clone().add(tangent));
    }

    onClick(){
        alert("mamma mia, a worker")
    }
}

