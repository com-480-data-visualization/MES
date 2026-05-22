const TOKEN_STORAGE_KEY = "mesGithubToken";

function loadStoredGithubToken() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    } catch (error) {
        console.warn("GitHub token could not be loaded:", error);
        return null;
    }
}

function storeGithubToken(token) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        if (token) {
            window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
    } catch (error) {
        console.warn("GitHub token could not be saved:", error);
    }
}

export let githubtoken = loadStoredGithubToken();

export function setGithubToken(token) {
    githubtoken = String(token || "").trim() || null;
    storeGithubToken(githubtoken);
    return githubtoken;
}

export function getGithubToken() {
    return githubtoken;
}
