import {getBackgroundMusicVolume, setBackgroundMusicVolume} from "../utils/backgroundMusic";
import {getGithubToken, setGithubToken} from "../utils/githubtoken";
import {getCommitAnimationSpeed, setCommitAnimationSpeed} from "../commitQueue/repositoryCommitPipeline";

function setPanelOpen(button, panel, isOpen) {
    const label = isOpen ? "Close settings" : "Open settings";

    panel.hidden = !isOpen;
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", label);
    button.title = label;
}

function updateVolumeLabel(label, volume) {
    if (!label) {
        return;
    }

    label.textContent = `${Math.round(volume * 100)}%`;
}

function updateSpeedButtons(buttons, speed) {
    buttons.forEach((button) => {
        const isActive = Number(button.dataset.speedMultiplier) === speed;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

export function setupSettingsButton() {
    const settingsButton = document.getElementById("settingsButton");
    const settingsPanel = document.getElementById("settingsPanel");
    const volumeInput = document.getElementById("musicVolume");
    const volumeLabel = document.getElementById("musicVolumeValue");
    const tokenInput = document.getElementById("githubTokenInput");

    if (!settingsButton || !settingsPanel) {
        return () => {};
    }

    const currentVolume = getBackgroundMusicVolume();
    const speedButtons = Array.from(settingsPanel.querySelectorAll("[data-speed-multiplier]"));
    setPanelOpen(settingsButton, settingsPanel, false);

    if (volumeInput) {
        volumeInput.value = String(Math.round(currentVolume * 100));
    }

    updateVolumeLabel(volumeLabel, currentVolume);
    updateSpeedButtons(speedButtons, getCommitAnimationSpeed());

    if (tokenInput) {
        tokenInput.value = getGithubToken() || "";
    }

    function handleSettingsClick(event) {
        event.stopPropagation();
        setPanelOpen(settingsButton, settingsPanel, settingsPanel.hidden);
    }

    function handlePanelClick(event) {
        event.stopPropagation();
    }

    function handleVolumeInput(event) {
        const volume = setBackgroundMusicVolume(Number(event.target.value) / 100);
        updateVolumeLabel(volumeLabel, volume);
    }

    function handleTokenInput(event) {
        setGithubToken(event.target.value);
    }

    function handleSpeedClick(event) {
        const button = event.currentTarget;
        const speed = setCommitAnimationSpeed(button.dataset.speedMultiplier);
        updateSpeedButtons(speedButtons, speed);
    }

    settingsButton.addEventListener("click", handleSettingsClick);
    settingsPanel.addEventListener("click", handlePanelClick);

    if (volumeInput) {
        volumeInput.addEventListener("input", handleVolumeInput);
    }

    if (tokenInput) {
        tokenInput.addEventListener("input", handleTokenInput);
    }

    speedButtons.forEach((button) => {
        button.addEventListener("click", handleSpeedClick);
    });

    return () => {
        settingsButton.removeEventListener("click", handleSettingsClick);
        settingsPanel.removeEventListener("click", handlePanelClick);

        if (volumeInput) {
            volumeInput.removeEventListener("input", handleVolumeInput);
        }

        if (tokenInput) {
            tokenInput.removeEventListener("input", handleTokenInput);
        }

        speedButtons.forEach((button) => {
            button.removeEventListener("click", handleSpeedClick);
        });
    };
}
