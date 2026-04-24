

export function mainAnimation(activeWorkers,scene,delta,controls){
    activeWorkers = activeWorkers.filter(worker => {
        if (worker.getMode() > 2) {
            scene.remove(worker);
            return false; // remove from array
        }

        worker.update(delta);
        return true; // keep
    });

    //building.upgrade(t)

    controls.update();
    return activeWorkers
}