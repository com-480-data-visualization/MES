import {createWorker, getWorker, reviveWorker} from "../main";
import {addToGraph} from "../components/generalCommitsGraph";


export function consumeCommits(queue, userRegistry, building) {

    if (queue.size() <= 0) return
    const commits = queue.peekAndAdvance();

    for (const commit of commits) {

        let commitId = getCommitterKey(commit)

        if (!userRegistry.has(commitId)) {
            userRegistry.set(commitId, [commit]);
            onNewCommiter(commitId)
        } else {
            userRegistry.get(commitId).push(commit);
            onCommit(commitId)
        }

    }
    if (commits.length > 0) addToGraph(commits)
    building.update(commits.length)
}


function getCommitterKey(commit) {
    return (commit.committer || "Unknown").trim().toLowerCase();
}

function onCommit(id){
    const w = getWorker(id)
    if (w.getMode()===1){
        w.c = 0
    } else {
        w.setMode(0)
    }
    reviveWorker(id);
    return
}

function onNewCommiter(id) {
    createWorker(id)
}
