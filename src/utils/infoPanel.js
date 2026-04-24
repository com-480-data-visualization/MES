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
