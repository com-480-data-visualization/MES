import {setBackgroundMusicTheme} from "../utils/backgroundMusic";

const DEFAULT_THEME = "night";

function getSceneTheme() {
    return document.documentElement.dataset.sceneTheme === "day" ? "day" : DEFAULT_THEME;
}

function getNextTheme(theme) {
    return theme === "night" ? "day" : "night";
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
