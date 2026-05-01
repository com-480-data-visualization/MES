import {resetGraph} from "../components/generalCommitsGraph";
import {closeInfo} from "../utils/infoPanel";
import {stopTimeline} from "../utils/timeline";
import {resetWelcome} from "./welcomeAnimation";

function resetVisualizationState({
    activeWorkers,
    building,
    queue,
    scene,
    userRegistry,
    workers
}) {
    queue.cancelRun();
    stopTimeline();
    resetGraph();

    activeWorkers.forEach((worker) => scene.remove(worker));
    workers.clear();
    userRegistry.clear();
    building.reset();

    document.getElementById("leaderboard").innerHTML = "";

    closeInfo();

    return [];
}

export function returnToWelcomeMode({
    activeWorkers,
    building,
    camera,
    controls,
    mode,
    queue,
    scene,
    userRegistry,
    workers
}) {
    if (mode === "welcome") {
        return {
            activeWorkers,
            mode,
            ongoing: false
        };
    }

    const nextActiveWorkers = resetVisualizationState({
        activeWorkers,
        building,
        queue,
        scene,
        userRegistry,
        workers
    });

    resetWelcome(scene,camera,controls);

    return {
        activeWorkers: nextActiveWorkers,
        mode: "welcome",
        ongoing: false
    };
}
