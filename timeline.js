

export function updateTimeline(elapsed){
    const bar = document.getElementById('progress');

    // Example: 5-second loop
    const duration = 5;
    const progress = (elapsed % duration) / duration;

    bar.style.width = (progress * 100) + "%";
}