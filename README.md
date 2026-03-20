# Project of Data Visualization (COM-480)

| Student's name            | SCIPER |
|---------------------------|--------|
| Sotero Pedro Romero Morón | 417231 |
| Mikhail Perevoznyk        | 347492 |
| Sheng-Wen Chen            | 414932 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (20th March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.
>
> Hint: some good pointers for finding quality publicly available datasets ([Google dataset search](https://datasetsearch.research.google.com/), [Kaggle](https://www.kaggle.com/datasets), [OpenSwissData](https://opendata.swiss/en/), [SNAP](https://snap.stanford.edu/data/) and [FiveThirtyEight](https://data.fivethirtyeight.com/)).

We will use GitHub API which has a rate limit of 5000 request per hour, with the API we will fetch information from the commit history for different projects, that will constitude our database.

The preprocessing will just consist in organizing commits based on its time stamp, register total number of commits in the whole project and the users who did them. 

If the projects at some point seems too little we could distinguish between normal commits, merges, rollbacks, etc.
### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.

The concept is to use the GitHub API to visualize repository activity in an animated way. Users could either select a specific repository or have one chosen randomly. Each repository’s commits over time would be represented as the construction of a building:

Each contributor would appear as a “worker” helping to build.

As commits accumulate, the building progresses through predefined stages until it is complete.

Multiple repositories could be visualized simultaneously as multiple buildings, showing parallel development and contributor activity.

The goal is to create an engaging and intuitive way to see the evolution of any public repository.

### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data


The initial idea is that the user can specify its repository, so statistics will vary depending on the project, we provide a basic example of the preprocessing for one repository

```javascript
/**
 * Fetch commits from GitHub API with pagination
 */
async function fetchCommits(owner, repo, token = null) {
    let allCommits = [];
    let page = 1;
    const perPage = 100;

    while (true) {
        const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${perPage}&page=${page}`;
        const headers = token ? { Authorization: `token ${token}` } : {};
        const res = await fetch(url, { headers });
        const commits = await res.json();
        if (!Array.isArray(commits) || commits.length === 0) break;

        allCommits = allCommits.concat(commits);
        page++;
    }

    return allCommits;
}

/**
 * Group commits by day
 */
function groupCommitsByDay(commits) {
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
```


### Related work


> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.

Common usage of this data could be:
 - [Developer activity over time](https://jokergoo.github.io/spiralize/index.html) – tracking which days or hours have the most commits.

 - [Team contribution analysis](https://gitlights.com/docker/github-commits/) – seeing who contributes most, or comparing individual vs. team productivity.

 - [Commit message analysis](https://arxiv.org/abs/2007.10912) – identifying common keywords like “fix”, “feature”, “refactor” to understand the nature of work.

Our approach is original because it creates a very entertaining and impactfull way to see how projects are build over time

Our inspiration has been drugs and alcohol.

## Milestone 2 (17th April, 5pm)

**10% of the final grade**


## Milestone 3 (29th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

