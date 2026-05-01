// Animate timeline
let interval;
let flag = false
export function startTimeline(totalcommits) {
    if (flag) return;
    flag = true;
    totalSeconds = totalcommits

    interval = setInterval(updateChronometer, 1000);
}

export function stopTimeline() {
    if (interval) {
        clearInterval(interval);
    }
    interval = undefined;
    flag = false;
    currentCommits = 0;
    totalSeconds = 0;
    currentSeconds = 0;
    ring.style.strokeDashoffset = circumference;
    timeText.textContent =
        `${String(0).padStart(2, "0")}:${String(0).padStart(2, "0")}`;


}

export function updateCommitChrono(number) {
    currentCommits += number;
    const progress = currentCommits / totalSeconds;
    ring.style.strokeDashoffset = circumference * (1 - progress);
}


let currentCommits = 0;
let totalSeconds;
let currentSeconds = 0;

const ring = document.querySelector(".progress-ring");
const timeText = document.getElementById("time");

const radius = 78;
const circumference = 2 * Math.PI * radius;

ring.style.strokeDasharray = circumference;
ring.style.strokeDashoffset = 0;

function updateChronometer() {
    const minutes = Math.floor(currentSeconds / 60);
    const seconds = currentSeconds % 60;

    timeText.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    currentSeconds++;
}

