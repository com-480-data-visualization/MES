import {GitHubCommitAPI} from "../api/api";
import {startCommitProducer} from "./commitProducer";
import {consumeCommits} from "./commitConsumer";


export function setUpCommitPipeline(repoUrl, queue) {
    try{
        const { owner, repo } = GitHubCommitAPI.parseRepoUrl(repoUrl);
        startCommitProducer(owner, repo, queue);
        return true
    } catch(e){
        return false;
    }

}


let delay = 0
export function manageCommits(delta,queue,userRegistry){
    delay += delta;
    if (delay < 1) return

    delay = 0
    consumeCommits(queue, userRegistry)
}



