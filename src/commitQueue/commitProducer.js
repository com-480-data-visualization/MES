import {GitHubCommitAPI} from "../api/api";

export function startCommitProducer(owner, repo, queue) {
    const api = new GitHubCommitAPI()
    api.fetchCommitsIntoQueue(owner, repo, queue);
}
