import {GitHubCommitAPI} from "../api/api";
import {githubtoken} from "../utils/githubtoken";

export function startCommitProducer(owner, repo, queue, lastPage, oldDate, runId) {
    const api = new GitHubCommitAPI(lastPage, oldDate, githubtoken)
    api.fetchCommitsIntoQueue(owner, repo, queue, {runId});
}
