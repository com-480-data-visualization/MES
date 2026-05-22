const MUSIC_TRACKS = {
    morning: `${import.meta.env.BASE_URL}audio/morning.mp3`,
    afternoon: `${import.meta.env.BASE_URL}audio/afternoon.mp3`,
    evening: `${import.meta.env.BASE_URL}audio/evening.mp3`
};
const DEFAULT_VOLUME = 0.25;
const VOLUME_STORAGE_KEY = "mesBackgroundMusicVolume";

let music = null;
let currentTheme = getSceneTheme();
let currentVolume = getStoredVolume();

function clampVolume(volume) {
    const parsedVolume = Number(volume);

    if (!Number.isFinite(parsedVolume)) {
        return DEFAULT_VOLUME;
    }

    return Math.max(0, Math.min(1, parsedVolume));
}

function getStoredVolume() {
    if (typeof window === "undefined") {
        return DEFAULT_VOLUME;
    }

    try {
        const storedVolume = window.localStorage.getItem(VOLUME_STORAGE_KEY);
        return storedVolume === null ? DEFAULT_VOLUME : clampVolume(storedVolume);
    } catch (error) {
        return DEFAULT_VOLUME;
    }
}

function storeVolume(volume) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch (error) {
        console.warn("Background music volume could not be saved:", error);
    }
}

function normalizeSceneTheme(theme) {
    if (theme === "day") return "morning";
    if (theme === "night") return "evening";
    return MUSIC_TRACKS[theme] ? theme : "evening";
}

function getSceneTheme() {
    return normalizeSceneTheme(document.documentElement.dataset.sceneTheme);
}

function getTrackForTheme(theme = getSceneTheme()) {
    return MUSIC_TRACKS[normalizeSceneTheme(theme)] || MUSIC_TRACKS.evening;
}

function getBackgroundMusic() {
    if (music) return music;

    music = new Audio(getTrackForTheme(currentTheme));
    music.loop = true;
    music.volume = currentVolume;
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
    currentTheme = normalizeSceneTheme(theme);
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
    currentVolume = clampVolume(volume);
    storeVolume(currentVolume);

    if (music) {
        music.volume = currentVolume;
    }

    return currentVolume;
}

export function getBackgroundMusicVolume() {
    return currentVolume;
}

export function toggleBackgroundMusic() {
    const audio = getBackgroundMusic();

    if (audio.paused) {
        return startBackgroundMusic();
    }

    pauseBackgroundMusic();
}
