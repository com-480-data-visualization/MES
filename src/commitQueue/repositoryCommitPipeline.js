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
        return info
    } catch (e) {
        return false;
    }

}


let delay = 0
let speed = 0.25
export function manageCommits(delta,queue,userRegistry, building, workerApi, totalCommits = 0){
    delay += delta;
    if (delay < speed) return

    delay = 0
    consumeCommits(queue, userRegistry, building, workerApi)
    renderLeaderboard(userRegistry, totalCommits)
}
