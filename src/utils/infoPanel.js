import * as d3 from "d3";

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
    const panel = renderCommits(commits)

    updateInfo(panel)
}


export function updateInfoWorker(userRegistry) {
    userregistry = userRegistry;
    if (id === undefined || !render) return
    renderInfo(id)
}

function renderGraph(commits) {
    const container = document.createElement("div");
    container.className = "committer-graph";

    const svg = d3.select(container)
        .append("svg")
        .attr("viewBox", "0 0 500 110")
        .attr("preserveAspectRatio", "none");

    const margin = {top: 10, right: 10, bottom: 28, left: 38};
    const width = 500 - margin.left - margin.right;
    const height = 110 - margin.top - margin.bottom;

    const data = getCommitterGraphData(commits);
    if (!data.length) return container;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const maxTime = d3.max(data, d => d.time);
    const minTime = Math.max(
        d3.min(data, d => d.time),
        maxTime - 1000 * 60 * 60 * 24 * 5
    );

    const x = d3.scaleTime()
        .domain([minTime, maxTime])
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, (d3.max(data, d => d.value) || 1) * 1.2])
        .range([height, 0]);

    const line = d3.line()
        .x(d => x(d.time))
        .y(d => y(d.value));

    g.append("path")
        .datum(data.filter(d => d.time >= minTime))
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x)
            .ticks(d3.timeDay.every(1))
            .tickFormat(d3.timeFormat("%b-%d")));

    g.append("g")
        .call(d3.axisLeft(y).ticks(4));

    return container;
}

function getCommitterGraphData(commits) {
    const commitsByHour = new Map();

    commits.forEach(commit => {
        if (!commit.date) return;
        const date = new Date(commit.date);
        date.setMinutes(0, 0, 0);
        const time = +date;

        commitsByHour.set(time, (commitsByHour.get(time) || 0) + 1);
    });

    return Array.from(commitsByHour.entries())
        .map(([time, value]) => ({time, value}))
        .sort((a, b) => a.time - b.time);
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
    container.appendChild(renderGraph(commits));

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
