import * as d3 from "d3";

export const INFO_PANEL_CLOSED_EVENT = "mes:info-panel-closed";

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

    window.dispatchEvent(new CustomEvent(INFO_PANEL_CLOSED_EVENT));
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
const committerGraphStates = new Map();
let committerGraphClipIndex = 0;

export function renderInfo(userid){
    if (userregistry === undefined) return
    const scrollState = render && id === userid ? getCommitListScrollState() : null;
    render = true
    id = userid;
    let commits = userregistry.get(userid);
    const panel = renderCommits(commits, userid)

    updateInfo(panel)
    restoreCommitListScrollState(scrollState)
}

export function renderCommitInfo(commit) {
    render = false;
    id = "";
    updateInfo(renderSingleCommit(commit));
}


export function updateInfoWorker(userRegistry) {
    userregistry = userRegistry;
    if (id === undefined || !render) return
    renderInfo(id)
}

function getCommitListScrollState() {
    const list = document.querySelector("#infoPanel .commits-list");
    if (!list) return null;

    const distanceFromBottom = list.scrollHeight - list.clientHeight - list.scrollTop;

    return {
        top: list.scrollTop,
        distanceFromBottom,
        wasAtBottom: distanceFromBottom <= 2
    };
}

function restoreCommitListScrollState(scrollState) {
    if (!scrollState) return;

    const list = document.querySelector("#infoPanel .commits-list");
    if (!list) return;

    if (scrollState.wasAtBottom) {
        list.scrollTop = list.scrollHeight;
        return;
    }

    const maxScrollTop = Math.max(0, list.scrollHeight - list.clientHeight);
    list.scrollTop = Math.min(scrollState.top, maxScrollTop);
}

function renderGraph(commits, userid) {
    const container = document.createElement("div");
    container.className = "committer-graph";

    const margin = {top: 10, right: 10, bottom: 30, left: 40};
    const svgWidth = Math.min(Math.max(window.innerWidth * 0.34, 300), 510);
    const width = svgWidth - margin.left - margin.right;
    const height = 100 - margin.top - margin.bottom;
    const svgHeight = height + margin.top + margin.bottom;
    const windowSize = 1000 * 60 * 60 * 24 * 5;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

    const data = getCommitterGraphData(commits);
    if (!data.length) return container;

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const clipId = `committer-clip-${committerGraphClipIndex++}`;

    svg.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    const maxTime = d3.max(data, d => d.time);
    const state = getCommitterGraphState(userid);

    if (state.viewEnd === null) {
        state.viewEnd = maxTime;
    }

    if (state.renderOn) {
        state.viewEnd = maxTime;
    }

    const x = d3.scaleTime()
        .range([0, width]);

    const y = d3.scaleLinear()
        .range([height, 0]);

    const xAxis = d3.axisBottom(x)
        .ticks(d3.timeHour.every(24))
        .tickFormat(d3.timeFormat("%b-%d"));

    const xAxisG = g.append("g")
        .attr("transform", `translate(0, ${height})`);

    const yAxisG = g.append("g");

    const yearLabel = svg.append("text")
        .attr("x", margin.left + 4)
        .attr("y", margin.top + 12)
        .attr("fill", "#ffffff")
        .attr("font-size", 12)
        .attr("font-weight", 800)
        .attr("pointer-events", "none");

    const line = d3.line()
        .defined(d => !isNaN(d.time) && !isNaN(d.value))
        .x(d => x(d.time))
        .y(d => y(d.value));

    const path = g.append("path")
        .attr("fill", "none")
        .attr("stroke", "#35f1c2")
        .attr("stroke-width", 2)
        .attr("clip-path", `url(#${clipId})`);

    const bisect = d3.bisector(d => d.time).left;

    function getVisibleData() {
        const start = state.viewEnd - windowSize;
        const i0 = Math.max(0, bisect(data, start) - 1);
        const i1 = Math.min(data.length, bisect(data, state.viewEnd) + 1);

        return data.slice(i0, i1);
    }

    function renderWindow() {
        const visible = getVisibleData();
        if (!visible.length) {
            path.datum([]).attr("d", null);
            return;
        }

        x.domain([state.viewEnd - windowSize, state.viewEnd]);
        yearLabel.text(d3.timeFormat("%Y")(new Date(state.viewEnd - windowSize)));
        y.domain([0, (d3.max(visible, d => d.value) || 1) * 1.2]);

        visible.sort((a, b) => a.time - b.time);

        path
            .datum(visible)
            .attr("d", line);

        xAxisG.call(xAxis);
        yAxisG.call(d3.axisLeft(y).ticks(4));
    }

    svg.on("wheel", (event) => {
        event.preventDefault();

        const direction = Math.sign(event.deltaY);
        if (direction === 0) return;

        const scrollSpeed = 1000 * 60 * 60;
        state.viewEnd += direction * scrollSpeed;
        state.viewEnd = Math.min(state.viewEnd, maxTime);
        state.renderOn = state.viewEnd >= maxTime - windowSize * 0.1;

        renderWindow();
    }, {passive: false});

    renderWindow();

    return container;
}

function getCommitterGraphState(userid) {
    if (!committerGraphStates.has(userid)) {
        committerGraphStates.set(userid, {
            viewEnd: null,
            renderOn: true
        });
    }

    return committerGraphStates.get(userid);
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

function renderCommits(commits, userid) {
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
    container.appendChild(renderGraph(commits, userid));

    const list = document.createElement("div");
    list.className = "commits-list";

    commits.forEach((commit, index) => {
        list.appendChild(renderCommitRow(commit, index));
    });

    container.appendChild(list);
    return container;
}

function renderSingleCommit(commit) {
    const container = document.createElement("div");
    container.className = "commits-container single-commit-container";

    const header = document.createElement("div");
    header.className = "commits-header single-commit-header";

    const title = document.createElement("h3");
    title.textContent = commit.committer || commit.commiter || "Unknown";

    header.appendChild(title);
    container.appendChild(header);

    const list = document.createElement("div");
    list.className = "commits-list single-commit-list";
    list.appendChild(renderCommitRow(commit, 0));

    container.appendChild(list);
    return container;
}

function renderCommitRow(commit, index) {
    const item = document.createElement("section");
    item.className = "ld_player commit";

    const rank = document.createElement("div");
    rank.className = "ld_rank commit-rank";
    rank.textContent = index + 1;

    const marker = document.createElement("span");
    marker.className = "ld_marker commit-marker";

    const content = document.createElement("div");
    content.className = "commit-content";

    const bar = document.createElement("div");
    bar.className = "ld_bar";

    const progress = document.createElement("div");
    progress.className = "ld_progress";
    progress.style.width = "36%";
    bar.appendChild(progress);

    const message = document.createElement("div");
    message.className = "ld_name commit-message";
    message.textContent = commit.message;

    const meta = document.createElement("div");
    meta.className = "commit-meta";

    const author = document.createElement("span");
    author.textContent = commit.committer || commit.commiter || "Unknown";

    const blockType = document.createElement("span");
    blockType.textContent = commit.buildingBlockType === "window" ? "Window commit" : "Block commit";

    const commitStat = document.createElement("div");
    commitStat.className = "ld_level commit-stat";

    const commitDate = document.createElement("span");
    commitDate.textContent = commit.date
        ? new Date(commit.date).toLocaleDateString(undefined, {month: "short", day: "numeric"})
        : "No date";

    const commitSha = document.createElement("small");
    commitSha.textContent = commit.sha ? commit.sha.slice(0, 7) : "pending";

    commitStat.appendChild(commitDate);
    commitStat.appendChild(commitSha);

    meta.appendChild(author);
    meta.appendChild(blockType);
    content.appendChild(bar);
    content.appendChild(message);
    content.appendChild(meta);
    item.appendChild(rank);
    item.appendChild(marker);
    item.appendChild(content);
    item.appendChild(commitStat);

    return item;
}
