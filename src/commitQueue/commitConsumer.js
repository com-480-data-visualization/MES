import {createWorker} from "../main";

export function consumeCommits(queue, userRegistry) {

    let toProcess = 5;
    let commit

    for (let i = 0; i < toProcess; i++) {
        if (queue.size() <= 0) return
        commit = queue.peek()

        let commitId = getCommitterKey(commit)

        if (!userRegistry.has(commitId)) {
            userRegistry.set(commitId, [commit]);
            onNewCommiter(commitId)
        } else {
            userRegistry.get(commitId).push(commit);
            onCommit(commitId)
        }

        queue.advance()
    }
}


function getCommitterKey(commit) {
    return (commit.committer || "Unknown").trim().toLowerCase();
}

function onCommit(id){
    return
}

function onNewCommiter(id) {
    createWorker(id)
}
