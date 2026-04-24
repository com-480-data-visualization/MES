export async function startCommitConsumer(queue, isCurrentJob, callbacks = {}, options = {}) {
    // Maps each committer ID to the list of commits made by that committer.
    const commitsByCommitter = new Map();
    // how long to wait after processing each commit before processing the next one; 
    // this can be used to slow down the visualization if commits are coming in too fast
    const commitDelay = options.commitDelay ?? 350;
    let processed = 0;

    try {
        // wait until the queue gives me the next commit; when one arrives, run the loop body
        for await (const commit of queue) {
            if (!isCurrentJob()) {
                break;
            }

            processed++;
            callbacks.onCommit?.(commit, processed);

            const committerKey = getCommitterKey(commit);
            const isNewCommitter = !commitsByCommitter.has(committerKey);

            if (isNewCommitter) {
                commitsByCommitter.set(committerKey, []);
                await callbacks.onNewCommitter?.(commit.committer, commit);
            }

            const committerCommits = commitsByCommitter.get(committerKey);
            committerCommits.push(commit);
            callbacks.onCommitterCommitsUpdated?.(commit.committer, committerCommits, commit);

            await delay(commitDelay);
        }

        if (isCurrentJob()) {
            callbacks.onDone?.(processed, commitsByCommitter.size, commitsByCommitter);
        }
    } catch (error) {
        if (isCurrentJob()) {
            callbacks.onError?.(error);
        }
    }
}

function getCommitterKey(commit) {
    return (commit.committer || "Unknown").trim().toLowerCase();
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
