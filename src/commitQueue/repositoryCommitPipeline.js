import {GitHubCommitAPI} from "../api/api";
import {startCommitProducer} from "./commitProducer";
import {consumeCommits} from "./commitConsumer";
import {getInfoRepo} from "../utils/repoInfo";
import {renderLeaderboard} from "../components/leaderboard";


export async function setUpCommitPipeline(repoUrl, queue) {
    try {
        const {owner, repo} = GitHubCommitAPI.parseRepoUrl(repoUrl);
        const runId = queue.startRun();
        const info = await getInfoRepo(owner, repo);
        if (!queue.isRunActive(runId)) return false;
        startCommitProducer(owner, repo, queue, info.lastPage, info.oldestDate, runId);
        return {
            ...info,
            owner,
            repo
        }
    } catch (e) {
        return false;
    }

}


const speed = 0.25
export const COMMIT_ANIMATION_SPEEDS = [1, 2, 4, 16];

let delay = 0
let commitAnimationSpeed = 1

export function setCommitAnimationSpeed(multiplier) {
    const nextSpeed = Number(multiplier);
    commitAnimationSpeed = COMMIT_ANIMATION_SPEEDS.includes(nextSpeed) ? nextSpeed : 1;
    return commitAnimationSpeed;
}

export function getCommitAnimationSpeed() {
    return commitAnimationSpeed;
}

export function manageCommits(delta,queue,userRegistry, building, workerApi, totalCommits = 0){
    delay += delta;
    if (delay < speed) return

    delay = 0
    for (let i = 0; i < commitAnimationSpeed; i++) {
        if (queue.size() <= 0) break;
        consumeCommits(queue, userRegistry, building, workerApi)
    }

    if (queue.isDrained()) {
        building.completeRoof()
    }
    renderLeaderboard(userRegistry, totalCommits, workerApi)
}
