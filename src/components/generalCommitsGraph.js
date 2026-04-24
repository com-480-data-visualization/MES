import * as d3 from "d3";


const svg = d3.select("svg");
const margin = { top: 10, right: 10, bottom: 30, left: 30 };

const width = 200 - margin.left - margin.right;
const height = 200 - margin.top - margin.bottom;

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

const xAxis = d3.axisBottom(x);

const xAxisG = g.append("g")
    .attr("transform", `translate(0, ${height})`);


const data = [];


let viewEnd = Date.now();
const windowSize = 30*1000 ; // 30 seconds visible




// ----------------------------
// LINE GENERATOR
// ----------------------------
const line = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.value));

// ----------------------------
// PATH
// ----------------------------
const path = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);


// ----------------------------
// GET VISIBLE DATA (viewport)
// ----------------------------
function getVisibleData() {
    return data.filter(d =>
        d.time >= viewEnd - windowSize &&
        d.time <= viewEnd
    );
}

// ----------------------------
// RENDER
// ----------------------------
function render() {
    const visible = getVisibleData();

    if (visible.length === 0) return;

    x.domain([viewEnd - windowSize, viewEnd]);

    path
        .datum(visible)
        .attr("d", line);

    xAxisG.call(xAxis);
}



let renderOn = true
export function startGraph() {

    svg.on("wheel", (event) => {
        event.preventDefault();

        const scrollSpeed = 30;

        const delta = event.deltaY || event.deltaX;

        viewEnd += delta * scrollSpeed;

        // prevent scrolling into future
        viewEnd = Math.min(viewEnd, Date.now());

        if (viewEnd <= Date.now()-windowSize/10) renderOn = false;
        else renderOn = true

        render();
    }, { passive: false });

    // initial draw
    render();

// update every second
    setInterval(() => {
        data.push({
            time: Date.now(),
            value: Math.random() * 100
        });
        if (renderOn) {
            viewEnd = Date.now();
            render();
        }
    }, 1000);
}
