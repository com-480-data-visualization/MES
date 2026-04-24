


const timelineRule = {
    min: 0,
    marker: 0,
    steps: 1,      // days per interval
    visibleTicks: 25 // number of ticks to keep in DOM
};


const ruler = document.getElementById("ruler");

// Initialize visible ticks
let ticks = [];
export function generateRuler() {
    ruler.innerHTML = "";
    ticks = []
    for (let i = 0; i < timelineRule.visibleTicks; i++) {
        const tick = document.createElement("div");
        tick.className = "ruler-tick";
        tick.style.width = ruler.clientWidth/(timelineRule.visibleTicks-2) + "px";
        tick.textContent = i; // initial value
        ruler.appendChild(tick);
        ticks.push(tick);
    }
}

// Update the ruler by shifting ticks
function updateRuler() {
    // Shift ruler by one tick
    const firstTick = ticks.shift();
    timelineRule.marker++;


    firstTick.textContent = timelineRule.marker + timelineRule.visibleTicks - 1;

    ruler.appendChild(firstTick);
    ticks.push(firstTick);

}

// Animate timeline
let interval;
let flag = false
export function startTimeline() {
    if (flag) return;
    flag = true;
    timelineRule.marker = 0;
    generateRuler();

    interval = setInterval(updateRuler, 1000);
}


