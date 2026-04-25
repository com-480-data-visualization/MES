import * as d3 from "d3";

const svg = d3.select("svg");

const margin = { top: 10, right: 10, bottom: 30, left: 40 };
const width = 500 - margin.left - margin.right;
const height = 100 - margin.top - margin.bottom;

const g = svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// ---- SCALES ----
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// ---- AXES ----
const xAxis = d3.axisBottom(x)
    .ticks(d3.timeHour.every(12))
    .tickFormat(d3.timeFormat("%H:%M"));

const xAxisG = g.append("g")
    .attr("transform", `translate(0, ${height})`);

const yAxisG = g.append("g");

// ---- LINE ----
const line = d3.line()
    .defined(d => !isNaN(d.time) && !isNaN(d.value)) // 🔥 prevents breaks
    .x(d => x(d.time))
    .y(d => y(d.value))


const path = g.append("path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);

// ---- DATA ----
const data = [];

// ---- STATE ----
let viewEnd = null;
let lastpoint = null;

let renderOn = true;

const windowSize = 1000 * 60 * 60 * 24 * 5; // 5 days

// ---- HELPERS ----
function toHour(date) {
    const d = new Date(date);
    d.setMinutes(0, 0, 0);
    return +d;
}

// binary search
const bisect = d3.bisector(d => d.time).left;

// get visible slice
function getVisibleData() {
    if (!viewEnd) return [];

    const start = viewEnd - windowSize;

    const i0 = Math.max(0, bisect(data, start) - 1);
    const i1 = Math.min(data.length, bisect(data, viewEnd) + 1);

    return data.slice(i0, i1);
}

// ---- RENDER ----
function render() {
    if (!data.length || !viewEnd) return;

    const visible = getVisibleData();
    if (!visible.length) return;

    // 🔥 ensure y scale always fits visible data
    const maxY = d3.max(visible, d => d.value) || 1;
    y.domain([0, maxY * 1.2]);

    // fixed window
    x.domain([viewEnd - windowSize, viewEnd]);

    // 🔥 IMPORTANT: sort slice to guarantee connectivity
    visible.sort((a, b) => a.time - b.time);

    path
        .datum(visible)
        .attr("d", line);

    xAxisG.call(xAxis);
    yAxisG.call(d3.axisLeft(y).ticks(4));
}

// ---- INPUT ----
export function addToGraph(points) {
    if (!points.length) return;

    const t = toHour(points[0].date);

    // merge / append safely
    const last = data[data.length - 1];

    if (!last || t > last.time) {
        data.push({
            time: t,
            value: points.length
        });
    } else if (last.time === t) {
        last.value += points.length;
    } else {
        const i = bisect(data, t);
        data.splice(i, 0, {
            time: t,
            value: points.length
        });
    }

    lastpoint = t;

    // 🔥 initialize view correctly
    if (viewEnd === null) {
        viewEnd = t;
    }

    if (renderOn) {
        viewEnd = t;
    }

    render();
}

// ---- INTERACTION ----
export function startGraph() {
    svg.on("wheel", (event) => {
        event.preventDefault();

        const scrollSpeed = 1000 * 60 * 60; // 1 hour
        const direction = Math.sign(event.deltaY);

        viewEnd += direction * scrollSpeed;

        viewEnd = Math.min(viewEnd, lastpoint);

        renderOn = (viewEnd >= lastpoint - windowSize * 0.1);

        render();
    }, { passive: false });
}