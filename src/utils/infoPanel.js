export function updateInfo(info){
    const container = document.getElementById('container');

    if (container.children.length > 1) {
        container.removeChild(container.lastChild);
    }

    const newBox = document.createElement('div');
    newBox.classList.add('box');
    newBox.textContent = info;

    container.appendChild(newBox);
}

export function formatCommitInfo(commit, count) {
    const shortSha = commit.sha.slice(0, 7);
    const firstLine = commit.message.split("\n")[0];

    return `#${count} ${shortSha} by ${commit.committer}: ${firstLine}`;
}

