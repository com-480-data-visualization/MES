export async function startCommitConsumer(queue, isCurrentJob, callbacks = {}, options = {}) {
    const knownCommitters = new Set();
    const commitDelay = options.commitDelay ?? 350;
    let processed = 0;

    try {
        for await (const commit of queue) {
            if (!isCurrentJob()) {
                break;
            }

            processed++;
            callbacks.onCommit?.(commit, processed);

            const committerKey = getCommitterKey(commit);
            if (!knownCommitters.has(committerKey)) {
                knownCommitters.add(committerKey);
                await callbacks.onNewCommitter?.(commit.committer, commit);
            }

            await delay(commitDelay);
        }

        if (isCurrentJob()) {
            callbacks.onDone?.(processed, knownCommitters.size);
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
