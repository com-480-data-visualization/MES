/**
 * GitHub Commit API Class
 */
class GitHubCommitAPI {
    constructor(token = null) {
        this.token = token;
    }

    /**
     * Fetch commits from a single page
     */
    async fetchCommit(owner, repo, page, perPage) {
        const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`;
        const headers = this.token ? { Authorization: `token ${this.token}` } : {};
        const res = await fetch(url, { headers });
        const commits = await res.json();
        return commits;
    }

    /**
     * Fetch all commits with pagination
     */
    async fetchAllCommits(owner, repo) {
        const perPage = 100; // max allowed by GitHub
        let page = 1;
        let allCommits = [];
        while (true) {
            const commits = await this.fetchCommit(owner, repo, page, perPage);
            if (commits.length === 0) break; // no more commits
            allCommits = allCommits.concat(commits);
            page++;
        }
        return allCommits;
    }

    /**
     * HELPER FUNCTIONS
     */
    // returns an array of [{commiter, message}]
    static getCommitSummary(commit) {
        return {
            commiter: commit.commit.author.name,
            message: commit.commit.message
        };
    }

    static groupCommitsByDay(commits) {
        const grouped = {};
        commits.forEach(c => {
            const date = new Date(c.commit.author.date).toISOString().split("T")[0]; // YYYY-MM-DD
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push({
                sha: c.sha,
                author: c.commit.author.name,
                message: c.commit.message
            });
        });
        return grouped;
    }

    static groupCommitsByAuthor(commits) {
        const grouped = {};
        commits.forEach(c => {
            const author = c.commit.author.name;
            if (!grouped[author]) grouped[author] = [];
            grouped[author].push({
                sha: c.sha,
                date: c.commit.author.date,
                message: c.commit.message
            });
        });
        return grouped;
    }
}

// Export for use in other modules
export { GitHubCommitAPI };


// (async () => {
//     // Load token from env or local file "githubtoken"
//     let token = process.env.GITHUB_TOKEN || null; // optional, helps avoid rate limits
//     if (!token) {
//         const { readFile } = await import("node:fs/promises");
//         try {
//             token = (await readFile("githubtoken", "utf8")).trim();
//             process.env.GITHUB_TOKEN = token;
//         } catch {
//             // No local token file; proceed unauthenticated
//         }
//     }

//     const api = new GitHubCommitAPI(token);

//     const commits = await api.fetchAllCommits("octocat", "Hello-World");
//     console.log("Total commits fetched:", commits.length);
//     // console.log("Sample commit:", commits[0]);


//     // const grouped = GitHubCommitAPI.groupCommitsByDay(commits);
//     // console.log("Days with commits:", Object.keys(grouped).length);
//     // console.log("Commits on 2021-01-01:", grouped);

//     // const byAuthor = GitHubCommitAPI.groupCommitsByAuthor(commits);
//     // console.log("Authors with commits:", Object.keys(byAuthor).length);
//     // console.log("Commits by octocat:", byAuthor["The Octocat"]);

//     const summaries = commits.map(GitHubCommitAPI.getCommitSummary);
//     console.log("Commit summaries:", summaries);

//     const linuxCommits = await api.fetchAllCommits("chenedwin54288", "SPSoC");
//     console.log("Total Linux commits fetched:", linuxCommits.length);

//     const linuxSummaries = linuxCommits.map(GitHubCommitAPI.getCommitSummary);
//     console.log("Linux commit summaries:", linuxSummaries);
// })();
