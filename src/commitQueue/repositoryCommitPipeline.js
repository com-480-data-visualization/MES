import {GitHubCommitAPI} from "../api/api";
import {AsyncQueue} from "../utils/asyncQueue";
import {startCommitProducer} from "./commitProducer";
import {startCommitConsumer} from "./commitConsumer";

// Coordinates one repository visualization job:
// producer fetches commits into a queue, consumer reads that queue and notifies the app.
export class RepositoryCommitPipeline {
    constructor(callbacks = {}) {
        // callbacks are UI/scene hooks supplied by main.js.
        this.callbacks = callbacks;
        this.api = new GitHubCommitAPI();
        this.activeJob = null;
    }

    start(repoUrl) {
        // Validate and normalize the GitHub URL before starting network work.
        const { owner, repo } = GitHubCommitAPI.parseRepoUrl(repoUrl);

        // Only one repository should drive the scene at a time.
        this.stop();

        // Each start gets its own queue and abort signal.
        const queue = new AsyncQueue();
        const abortController = new AbortController();
        const job = {
            id: crypto.randomUUID(),
            abortController
        };

        this.activeJob = job;
        this.callbacks.onRepoSelected?.(owner, repo);
        this.callbacks.onStatus?.(`Fetching commits for ${owner}/${repo}...`);

        // Start producer and consumer at the same time. The consumer waits when
        // the queue is empty, then continues as soon as the producer enqueues data.
        startCommitProducer(this.api, owner, repo, queue, abortController.signal);
        startCommitConsumer(
            queue,
            // Prevent older jobs from updating the app after a new repo is submitted.
            () => this.activeJob?.id === job.id,
            {
                onCommit: (commit, count) => {
                    this.callbacks.onCommit?.(commit, count);
                },
                onNewCommitter: async (committer, commit) => {
                    await this.callbacks.onNewCommitter?.(committer, commit);
                },
                onDone: (commitCount, committerCount) => {
                    this.callbacks.onStatus?.(
                        `Finished reading ${commitCount} commits from ${committerCount} committers.`
                    );
                },
                onError: (error) => {
                    this.callbacks.onStatus?.(error.message);
                }
            }
        );
    }

    stop() {
        if (this.activeJob) {
            // Abort cancels the fetch request that belongs to the active producer.
            this.activeJob.abortController.abort();
            this.activeJob = null;
        }
    }
}
