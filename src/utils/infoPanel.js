export function updateInfo(info){
    const container = document.getElementById('container');

    if (container.children.length > 1) {
        container.removeChild(container.lastChild);
    }

    container.appendChild(info);
}

let render = false
let id = ""
let userregistry
export function renderInfo(userid){
    console.log(userregistry)
    if (userregistry === undefined) return
    render = true
    id = userid;
    console.log(userid);
    console.log(userregistry)
    let commits = userregistry.get(userid);
    const graph = renderGraph(commits)
    const Table = renderCommits(commits)

    const element = document.createElement("div").appendChild(graph).appendChild(Table)
    updateInfo(element)
}


export function updateInfoWorker(userRegistry) {
    userregistry = userRegistry;
    if (id === undefined || !render) return
    renderInfo(id)
}

function renderGraph(commits) {
    return document.createElement('div');
}

function renderCommits(commits) {
    const container = document.createElement("div");
    container.className = "commits-container";

    commits.forEach(commit => {
        const item = document.createElement("div");
        item.className = "commit";

        item.textContent = commit.message;
        container.appendChild(item);
    });

    return container;
}




