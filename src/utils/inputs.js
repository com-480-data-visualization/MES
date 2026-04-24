import * as THREE from "three";

function setUpResize(camera,renderer){
    //make window resizable
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function setUpRaycaster(camera){
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();


    function onClick(event, trackedObjects) {
        // Convert mouse position to normalized device coordinates (-1 to +1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // Update the raycaster
        raycaster.setFromCamera(mouse, camera);

        // Array of objects to test for intersection
        const intersects = raycaster.intersectObjects(trackedObjects,true);

        if (intersects.length > 0) {
            let objectHit = intersects[0].object;

            while (objectHit && !objectHit.onClick) {
                objectHit = objectHit.parent; // walk up
            }

            if (objectHit?.onClick) {
                objectHit.onClick();
            }
        }
    }

    return onClick



}


export function setUpInputs(camera,renderer){

    setUpResize(camera,renderer);

    return setUpRaycaster(camera);

}