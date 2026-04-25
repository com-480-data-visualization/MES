import {GitHubCommitAPI} from "../api/api";
import {startCommitProducer} from "./commitProducer";
import {consumeCommits} from "./commitConsumer";
import {getInfoRepo} from "../utils/repoInfo";


export async function setUpCommitPipeline(repoUrl, queue) {
    try {
        const {owner, repo} = GitHubCommitAPI.parseRepoUrl(repoUrl);
        const info = await getInfoRepo(owner, repo);
        startCommitProducer(owner, repo, queue, info.lastPage, info.oldestDate);
        return info
    } catch (e) {
        return false;
    }

}


let delay = 0
let speed = 0.25
export function manageCommits(delta,queue,userRegistry, building){
    delay += delta;
    if (delay < speed) return

    delay = 0
    consumeCommits(queue, userRegistry, building)
}



