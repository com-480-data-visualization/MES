const MUSIC_PATH = `${import.meta.env.BASE_URL}audio/background.mp3`;

let music = null;

function getBackgroundMusic() {
    if (music) return music;

    music = new Audio(MUSIC_PATH);
    music.loop = true;
    music.volume = 0.25;
    music.preload = "auto";

    return music;
}

export async function startBackgroundMusic() {
    const audio = getBackgroundMusic();

    if (!audio.paused) return;

    try {
        await audio.play();
    } catch (error) {
        console.warn("Background music could not start:", error);
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
