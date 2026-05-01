import {addToGraph} from "../components/generalCommitsGraph";
import {updateInfoWorker} from "../utils/infoPanel";
import {updateCommitChrono} from "../utils/timeline";


export function consumeCommits(queue, userRegistry, building, workerApi) {

    if (queue.size() <= 0) return
    const commits = queue.peekAndAdvance();

    for (const commit of commits) {

        let commitId = getCommitterKey(commit)

        if (!userRegistry.has(commitId)) {
            userRegistry.set(commitId, [commit]);
            onNewCommiter(commitId, workerApi)
        } else {
            userRegistry.get(commitId).push(commit);
            onCommit(commitId, workerApi)
        }

    }
    if (commits.length > 0) {
        addToGraph(commits)
        updateInfoWorker(userRegistry)
        updateCommitChrono(commits.length)
    }

    building.update(commits.length)
}


function getCommitterKey(commit) {
    return (commit.committer || "Unknown").trim().toLowerCase();
}

function onCommit(id, workerApi){
    const w = workerApi.getWorker(id)
    if (w.getMode()===1){
        w.c = 0
    } else {
        w.setMode(0)
    }
    workerApi.reviveWorker(id);
    return
}

function onNewCommiter(id, workerApi) {
    workerApi.createWorker(id)
}
