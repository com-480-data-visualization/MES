export function updateInfo(info){
    const container = document.getElementById('user-container');

    if (!(info instanceof Node)) {
        const textInfo = document.createElement("div");
        textInfo.textContent = info;
        info = textInfo;
    }

    info.id = "infoPanel";
    container.replaceChildren(info, renderCloseButton());
}

export function closeInfo(event){
    event?.stopPropagation();

    const container = document.getElementById("user-container");
    if (container) {
        container.replaceChildren();
    }

    render = false
    id = ""
}

function renderCloseButton(){
    const button = document.createElement("button");
    button.type = "button";
    button.className = "info-close-button";
    button.setAttribute("aria-label", "Close information panel");
    button.addEventListener("click", closeInfo);

    return button;
}

let render = false
let id = ""
let userregistry
export function renderInfo(userid){
    if (userregistry === undefined) return
    render = true
    id = userid;
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

    const header = document.createElement("div");
    header.className = "commits-header";

    const title = document.createElement("h3");
    title.textContent = commits[0].committer || commits[0].commiter || "Unknown";

    const count = document.createElement("span");
    count.className = "commits-count";
    count.textContent = `${commits.length} ${commits.length === 1 ? "commit" : "commits"}`;

    header.appendChild(title);
    header.appendChild(count);
    container.appendChild(header);

    const list = document.createElement("div");
    list.className = "commits-list";

    commits.forEach(commit => {
        const item = document.createElement("div");
        item.className = "commit";

        const marker = document.createElement("span");
        marker.className = "commit-marker";

        const content = document.createElement("div");
        content.className = "commit-content";

        const message = document.createElement("p");
        message.className = "commit-message";
        message.textContent = commit.message;

        const meta = document.createElement("div");
        meta.className = "commit-meta";

        const author = document.createElement("span");
        author.textContent = commit.committer || commit.commiter || "Unknown";

        const date = document.createElement("span");
        date.textContent = commit.date
            ? new Date(commit.date).toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric"})
            : "No date";

        const sha = document.createElement("span");
        sha.className = "commit-sha";
        sha.textContent = commit.sha ? commit.sha.slice(0, 7) : "pending";

        meta.appendChild(author);
        meta.appendChild(date);
        meta.appendChild(sha);
        content.appendChild(message);
        content.appendChild(meta);
        item.appendChild(marker);
        item.appendChild(content);
        list.appendChild(item);
    });

    container.appendChild(list);
    return container;
}
