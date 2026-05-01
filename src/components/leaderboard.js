import {infoRepo} from "../main";


function getTopCommitters(userRegistry) {
    return Array.from(userRegistry.entries())
        .map(([userId, commits]) => ({
            userId,
            commitCount: commits.length,
            progress : commits.length *100 / infoRepo.totalCommits
        }))
        .sort((a, b) => b.commitCount - a.commitCount)
}

export function renderLeaderboard(userRegistry) {
    console.log(
        userRegistry
    )
    const topUsers = getTopCommitters(userRegistry);
    console.log(topUsers)

    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = '';
    leaderboard.innerHTML += ""


    topUsers.forEach((item, index) => {

        leaderboard.innerHTML += `
        <section class="ld_player">
          <div class="ld_rank">${index + 1}</div>
          <div>
            <div class="ld_bar">
              <div class="ld_progress" style="width:${item.progress}%" ></div>
            </div>
            <div class="ld_name">${item.userId}</div>
          </div>
          <div class="ld_level">
            ${item.commitCount}
            <small>Commits</small>
          </div>
        </section>
      `;
    });
}
