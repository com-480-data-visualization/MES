const MUSIC_TRACKS = {
    day: `${import.meta.env.BASE_URL}audio/morning.mp3`,
    night: `${import.meta.env.BASE_URL}audio/evening.mp3`
};

let music = null;
let currentTheme = getSceneTheme();

function getSceneTheme() {
    return document.documentElement.dataset.sceneTheme === "day" ? "day" : "night";
}

function getTrackForTheme(theme = getSceneTheme()) {
    return MUSIC_TRACKS[theme] || MUSIC_TRACKS.night;
}

function getBackgroundMusic() {
    if (music) return music;

    music = new Audio(getTrackForTheme(currentTheme));
    music.loop = true;
    music.volume = 0.25;
    music.preload = "auto";

    return music;
}

export async function startBackgroundMusic() {
    const audio = getBackgroundMusic();
    setBackgroundMusicTheme(getSceneTheme());

    if (!audio.paused) return;

    try {
        await audio.play();
    } catch (error) {
        console.warn("Background music could not start:", error);
    }
}

export async function setBackgroundMusicTheme(theme) {
    currentTheme = theme === "day" ? "day" : "night";
    const audio = getBackgroundMusic();
    const nextTrack = getTrackForTheme(currentTheme);
    const wasPlaying = !audio.paused;

    if (audio.src.endsWith(nextTrack)) return;

    audio.src = nextTrack;
    audio.load();

    if (wasPlaying) {
        await startBackgroundMusic();
    }
}

export function pauseBackgroundMusic() {
    if (!music) return;

    music.pause();
}

export function setBackgroundMusicVolume(volume) {
    getBackgroundMusic().volume = Math.max(0, Math.min(1, volume));
}

export function toggleBackgroundMusic() {
    const audio = getBackgroundMusic();

    if (audio.paused) {
        return startBackgroundMusic();
    }

    pauseBackgroundMusic();
}
