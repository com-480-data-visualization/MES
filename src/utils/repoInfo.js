import {githubtoken} from "./githubtoken";

export async function getInfoRepo(owner, repo) {
    const perPage = 100;
    const token = githubtoken

    const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
        }
        : {
            Accept: "application/vnd.github+json",
        };

    // 1. Get newest commits (page 1)
    const firstRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=1`,
        {headers}
    );

    if (!firstRes.ok) {
        throw new Error(`Request failed: ${firstRes.status}`);
    }

    const newestCommits = await firstRes.json();
    const newestDate = new Date(newestCommits[0].commit.author.date);

    // 2. Find last page from headers
    const linkHeader = firstRes.headers.get("link");

    let lastPage = 1;

    if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (match) {
            lastPage = parseInt(match[1], 10);
        }
    }

    // 3. Get oldest commits (last page)
    const lastRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${lastPage}`,
        {headers}
    );

    if (!lastRes.ok) {
        throw new Error(`Request failed: ${lastRes.status}`);
    }


    const oldestCommits = await lastRes.json();
    const oldestDate = new Date(
        oldestCommits[oldestCommits.length - 1].commit.author.date
    );

    const totalCommits =
        (lastPage - 1) * perPage + oldestCommits.length;

    // 4. Compute time difference in hours
    const diffMs = newestDate - oldestDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    return {
        lastPage,
        diffHours,
        oldestDate,
        totalCommits,
    };
}
