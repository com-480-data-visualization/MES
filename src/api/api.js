import {Building} from "../components/building";
import {setBuilding} from "../main";

/**
 * GitHub Commit API Class
 */
class GitHubCommitAPI {
    constructor(lastPage = 1,oldDate = null, token = null) {
        this.token = token;
        this.lastPage = lastPage
        this.oldDate = oldDate;
    }

    /**
     * Fetch commits from a single page
     */
    async fetchCommit(owner, repo, page, perPage, signal = undefined) {
        const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`;
        const headers = this.token ? { Authorization: `token ${this.token}` } : {};
        const res = await fetch(url, { headers, signal });

        if (!res.ok) {
            throw new Error(`GitHub request failed with ${res.status}: ${res.statusText}`);
        }

        const commits = await res.json();
        return commits;
    }
    /**
     * Stream commits into an async queue as pages arrive.
     */
    async fetchCommitsIntoQueue(owner, repo, queue, options = {}) {
        const perPage = options.perPage ?? 100;
        let page = this.lastPage;


        while (page > 0) {
            const commits = await this.fetchCommit(owner, repo, page, perPage);
            if (commits.length === 0) break;

            commits.reverse().forEach((commit) => queue.push(this.getCommitSummary(commit)));
            page--;
        }

    }

    /**
     * HELPER FUNCTIONS
     */
    // returns an array of [{commiter, message}]
    getCommitSummary(commit) {
        const committer = commit.commit.author.name;
        const newDate = new Date(commit.commit.author.date);
        const diffMs = newDate - this.oldDate;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));


        return {
            sha: commit.sha,
            committer,
            commiter: committer,
            date: commit.commit.author.date,
            hours: diffHours,
            message: commit.commit.message
        };
    }

    static parseRepoUrl(repoUrl) {
        const url = new URL(repoUrl.trim());

        if (url.hostname !== "github.com") {
            throw new Error("Please enter a github.com repository URL.");
        }

        const [owner, repo] = url.pathname.replace(/^\/+|\/+$/g, "").split("/");

        if (!owner || !repo) {
            throw new Error("Please enter a URL like https://github.com/owner/repository.");
        }

        return {
            owner,
            repo: repo.replace(/\.git$/, "")
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


