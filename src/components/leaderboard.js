



function getTopCommitters(userRegistry) {
    return Array.from(userRegistry.entries())
        .map(([userId, commits]) => ({
            userId,
            commitCount: commits.length
        }))
        .sort((a, b) => b.commitCount - a.commitCount)
        .slice(0, 3);
}

export function renderLeaderboard(userRegistry) {
    const container = document.getElementById("leaderboard");
    const topUsers = getTopCommitters(userRegistry);

    container.innerHTML = "<p>Top Committers</p>";

    topUsers.forEach((user, index) => {
        const div = document.createElement("div");
        div.className = "entry";
        div.innerHTML = `
          <span class="rank">#${index + 1}</span>
          <span>${user.userId}</span>
          <span>${user.commitCount}</span>
        `;
        container.appendChild(div);
    });
}
