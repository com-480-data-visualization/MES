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

Some other projects that are using similar data are:
 - [Developer activity over time](https://jokergoo.github.io/spiralize/index.html) – tracking which days or hours have the most commits.

 - [Team contribution analysis](https://gitlights.com/docker/github-commits/) – seeing who contributes most, or comparing individual vs. team productivity.

 - [Commit message analysis](https://arxiv.org/abs/2007.10912) – identifying common keywords like “fix”, “feature”, “refactor” to understand the nature of work.

Our approach is original because it creates a very entertaining and impactfull way to see how projects are build over time

Our primary inspiration stems from simulated environments and "tycoon-style" management games (e.g., SimCity or Factorio), where complex systems are represented through emergent visual growth.
We are also inspired by the concept of Gamification in Productivity, exploring how the visualization of "building" can provide a sense of progress and accomplishment. We aim to capture the "organic growth" of software—the idea that a codebase is not just a static file, but a living architecture that requires continuous labor and collaborative assembly.

## Milestone 2 (17th April, 5pm)

**10% of the final grade**
- The report can be found here: [Report](Milestone2DataViz.pdf)
- [Link to the website](https://com-480-data-visualization.github.io/MES/)
- [Link to the Figma sketch](https://www.figma.com/proto/mw3akGDWHF63UWxHszbNUT/Sin-t%C3%ADtulo?node-id=2-57&t=gigjwsghe1Kr08Ma-1&scaling=contain&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2%3A57)


## Milestone 3 (29th May, 5pm)

**80% of the final grade**

### Project overview

MES is an interactive website that turns the commit history of a GitHub repository into a small animated construction scene. A user enters a public GitHub repository URL, the website fetches the repository commits through the GitHub REST API, and the commits are replayed over time. Each commit becomes a block in a building, each contributor is represented as a worker, and the surrounding interface shows supporting views such as the commit timeline, contributor leaderboard, individual commit details, and repository activity graphs.

For very large repositories, the project now grows into a city instead of one extremely tall building. After a building receives a random number of commits between 200 and 500, its roof is completed and the next commits start a new building in another location. This keeps each building readable while still showing the scale of repositories with many commits.

The goal is to make software history understandable at a glance. Instead of reading a long commit log, the user can see who contributed, when the activity happened, and how the repository grew.

### How to run the website locally

Prerequisites:

- Install [Node.js](https://nodejs.org/) and npm.
- Clone or download this repository.
- Open a terminal in the project root folder.

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print a local URL in the terminal. Because the project is configured with `base: '/MES/'`, the local URL usually looks like:

```text
http://localhost:5173/MES/
```

Build the production version:

```bash
npm run build
```

The production files are generated in the `dist/` folder.

### How to use the website

1. Open the website in the browser.
2. Enter a GitHub repository URL, for example `https://github.com/owner/repository`.
3. Click `Enter`.
4. The website fetches repository metadata and commits.
5. The visualization starts: workers walk to the active construction site, commits become building blocks, the graph and leaderboard update, and the timeline tracks progress.
6. Use the settings button to adjust music volume, optionally add a GitHub token, and change animation speed.
7. Use the theme button to switch the environment theme.
8. Click workers or commit blocks to inspect contributor or commit details.

A GitHub token is optional, but it is useful because unauthenticated GitHub API requests have stricter rate limits.

### Data and API

The project uses the GitHub REST API:

- GitHub commits API documentation: https://docs.github.com/en/rest/commits
- Endpoint used by the project: `https://api.github.com/repos/{owner}/{repo}/commits`

The website reads each commit's author name, date, SHA, and message. These fields are transformed into a simpler internal format before being added to the animation queue.

### Contributors

| Name | SCIPER |
|------|--------|
| Sotero Pedro Romero Morón | 417231 |
| Mikhail Perevoznyk | 347492 |
| Sheng-Wen Chen | 414932 |

### Tools and libraries

- [Three.js](https://threejs.org/docs/) is used for the 3D scene, camera, renderer, building geometry, workers, sky, tile, lights, and model loading.
- [D3.js](https://d3js.org/) is used for the SVG graphs, scales, axes, and line charts.
- [Vite](https://vite.dev/guide/) is used as the local development server and production build tool.
- JavaScript modules are used to organize the website into API, animation, 3D components, UI components, and utilities.
- HTML and CSS define the page structure, welcome overlay, settings panel, leaderboard, info panel, graph styling, and responsive layout.

### Codebase structure

```text
MES/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
├── public/
│   ├── audio/
│   │   ├── README.md
│   │   ├── afternoon.mp3
│   │   ├── evening.mp3
│   │   └── morning.mp3
│   └── models/
│       └── RobotExpressive.glb
└── src/
    ├── main.js
    ├── api/
    ├── commitQueue/
    ├── components/
    │   ├── building.js
    │   ├── city.js
    │   ├── generalCommitsGraph.js
    │   ├── leaderboard.js
    │   ├── sky.js
    │   ├── tile.js
    │   └── worker.js
    ├── styles/
    ├── utils/
    └── worldbuilding/
```

### Source files

#### `src/main.js`

This is the entry point of the application. It creates the Three.js scene, camera, renderer, orbit controls, world objects, queue, worker registry, and main animation loop. It also connects UI events such as repository submission, home navigation, settings, theme switching, and scene clicks.

#### `src/api/`

- `api.js`: Wraps calls to the GitHub API. It parses GitHub repository URLs, fetches paginated commits, streams commits into the queue, and converts raw GitHub commit objects into smaller commit summaries used by the visualization.

#### `src/commitQueue/`

- `asyncQueue.js` lives in `src/utils/`, but it works together with this folder.
- `commitProducer.js`: Creates a `GitHubCommitAPI` instance and starts fetching commits into the queue.
- `commitConsumer.js`: Reads commits from the queue, updates contributor data, triggers worker behavior, updates the graph and timeline, and adds commit blocks to the building.
- `repositoryCommitPipeline.js`: Coordinates the commit pipeline. It sets up repository fetching and controls how quickly commits are consumed during the animation.

#### `src/components/`

- `building.js`: Defines one 3D building. It creates the foundation, walls, commit blocks, windows, roof, chimney, click behavior for commit blocks, and reset logic. Each building has its own commit counter, so a new building starts counting from zero.
- `city.js`: Manages multiple buildings. It keeps track of the active building, chooses a random commit limit between 200 and 500, completes the roof when that limit is reached, and starts the next building at a new location. It lets large repositories become a readable city instead of one building that grows too high.
- `generalCommitsGraph.js`: Draws the repository-level D3 line graph. It groups visible commit activity over time, renders axes, supports scrolling through time, and resets when the visualization restarts.
- `leaderboard.js`: Renders the top committers list. It sorts contributors by commit count and displays their progress relative to the total commits.
- `sky.js`: Creates and updates the background sky, including theme-dependent visual elements.
- `tile.js`: Creates the ground plane, grid, and animated fireflies. It also updates colors when the theme changes.
- `worker.js`: Defines the animated robot contributor. It loads the GLB model, assigns colors, creates worker paths, switches animations, handles walking/working/returning states, and shows contributor details when clicked.

#### `src/styles/`

- `style.css`: Contains the visual styling for the entire website: welcome screen, controls, settings panel, theme/home buttons, repository panel, leaderboard, commit detail panel, graphs, timeline, and responsive layout.

#### `src/utils/`

- `asyncQueue.js`: Stores commits as they arrive from the API and lets the animation consume them in chronological groups.
- `backgroundMusic.js`: Loads, starts, stops, and controls background music volume. It also stores volume preferences locally.
- `creators.js`: Creates core Three.js objects such as the scene, camera, renderer, and orbit controls.
- `githubtoken.js`: Stores and retrieves the optional GitHub token using local storage.
- `infoPanel.js`: Renders contributor details, single commit details, per-contributor commit graphs, scroll state, and info-panel closing behavior.
- `inputs.js`: Sets up resize handling and raycasting so users can click 3D objects in the scene.
- `palette.js`: Reads CSS color variables and provides theme-aware colors to the JavaScript scene.
- `pathGenerator.js`: Generates worker paths from outside the scene toward the building footprint.
- `repoInfo.js`: Fetches repository summary information, including newest/oldest commit dates, last page, and total commit count.
- `timeline.js`: Controls the circular timeline and commit progress indicator.

#### `src/worldbuilding/`

- `buildWorld.js`: Creates the main world objects and adds them to the scene: city, sky, and tile. The city object manages the active building internally.
- `homeButton.js`: Resets the visualization and returns the user to the welcome screen.
- `mainAnimation.js`: Updates active workers and orbit controls during the visualization.
- `settingsButton.js`: Opens and closes the settings panel, updates music volume, stores the GitHub token, and manages animation speed controls.
- `themeButton.js`: Switches between scene themes and updates world colors/music.
- `welcomeAnimation.js`: Controls the welcome-screen robot, camera transition into the visualization, and visibility of the main UI.

### Public assets

- `public/models/RobotExpressive.glb`: The 3D robot model used for contributors.
- `public/audio/morning.mp3`: Background music for the morning theme.
- `public/audio/afternoon.mp3`: Background music for the afternoon theme.
- `public/audio/evening.mp3`: Background music for the evening theme.
- `public/audio/README.md`: Notes about the audio assets.

### How the website works internally

The website is organized around a simple pipeline:

1. The user submits a repository URL.
2. `api.js` parses the URL and fetches repository commit data from GitHub.
3. `repoInfo.js` gathers high-level repository information such as commit count and date range.
4. `commitProducer.js` streams commits into the async queue.
5. `repositoryCommitPipeline.js` decides when to consume the next commit batch.
6. `commitConsumer.js` reads commits from the queue and updates the visualization.
7. `city.js` decides which building should receive the next commit. If the active building has reached its random 200-500 commit limit, the city completes that roof and creates a new building elsewhere.
8. `building.js` turns commits into 3D blocks on the active building.
9. `worker.js` animates contributor robots and sends them toward the active construction site.
10. `generalCommitsGraph.js`, `leaderboard.js`, `infoPanel.js`, and `timeline.js` update the 2D interface.
11. `main.js` keeps everything moving inside the animation loop.

This separation keeps the data flow understandable: API files fetch data, queue files schedule data, component files display data, utility files support shared behavior, and worldbuilding files control the scene-level experience.

### Deployment

The project is designed to be deployed as a static website. After running:

```bash
npm run build
```

the generated `dist/` folder can be deployed to GitHub Pages or another static hosting service. The current Vite base path is set for the GitHub Pages URL:

https://com-480-data-visualization.github.io/MES/

## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone
