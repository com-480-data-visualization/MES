import {setBackgroundMusicTheme} from "../utils/backgroundMusic";

const DEFAULT_THEME = "evening";
const THEME_ORDER = ["morning", "afternoon", "evening"];

function normalizeSceneTheme(theme) {
    if (theme === "day") return "morning";
    if (theme === "night") return "evening";
    return THEME_ORDER.includes(theme) ? theme : DEFAULT_THEME;
}

function getSceneTheme() {
    return normalizeSceneTheme(document.documentElement.dataset.sceneTheme);
}

function getNextTheme(theme) {
    const index = THEME_ORDER.indexOf(normalizeSceneTheme(theme));
    return THEME_ORDER[(index + 1) % THEME_ORDER.length];
}

function refreshWorldColors(world) {
    world.sky.updateColors();
    world.tile.updateColors();
}

function updateThemeButton(button, theme) {
    const nextTheme = getNextTheme(theme);
    const label = `Switch to ${nextTheme} mode`;

    button.setAttribute("aria-label", label);
    button.title = label;
}

export function setupThemeButton(world) {
    const themeButton = document.getElementById("themeButton");

    if (!themeButton) {
        return () => {};
    }

    updateThemeButton(themeButton, getSceneTheme());

    function handleThemeClick(event) {
        event.stopPropagation();

        const nextTheme = getNextTheme(getSceneTheme());
        document.documentElement.dataset.sceneTheme = nextTheme;
        refreshWorldColors(world);
        setBackgroundMusicTheme(nextTheme);
        updateThemeButton(themeButton, nextTheme);
    }

    themeButton.addEventListener("click", handleThemeClick);

    return () => themeButton.removeEventListener("click", handleThemeClick);
}
