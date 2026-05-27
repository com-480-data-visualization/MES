import {resetGraph} from "../components/generalCommitsGraph";
import {stopBackgroundMusic} from "../utils/backgroundMusic";
import {closeInfo} from "../utils/infoPanel";
import {stopTimeline} from "../utils/timeline";
import {resetWelcome} from "./welcomeAnimation";

function resetVisualizationState({
    activeWorkers,
    building,
    queue,
    scene,
    tile,
    userRegistry,
    workers
}) {
    queue.cancelRun();
    stopBackgroundMusic();
    stopTimeline();
    resetGraph();

    activeWorkers.forEach((worker) => scene.remove(worker));
    workers.clear();
    userRegistry.clear();
    building.reset();
    tile.resetFireflies();

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
    tile,
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
        tile,
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
