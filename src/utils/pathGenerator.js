import * as THREE from "three";




export function generatePath(baseCoordinates = createDefaultBaseCoordinates()){
    const coordinates = normalizeBaseCoordinates(baseCoordinates);
    const bounds = getBounds(coordinates);
    const center =  {
        x: (bounds.minX + bounds.maxX) / 2,
        y: 2.5,
        z: (bounds.minZ + bounds.maxZ) / 2
    }
    const theta_max = Math.random() * Math.PI * 2;
    const r_max = 50

    const start = new THREE.Vector3(
        center.x + r_max * Math.cos(theta_max),
        center.y,
        center.z + r_max * Math.sin(theta_max)
    )

    const stop = pickWorkerStop(coordinates, bounds, center.y);
    const path = new THREE.CurvePath();
    const paddedBounds = padBounds(bounds, 4);

    if (!lineIntersectsBounds(start, stop.position, paddedBounds)) {
        path.add(new THREE.LineCurve3(start, stop.position));
        return path;
    }

    const startSide = getOutsideSide(start, paddedBounds);
    const startWaypoint = pointOnSide(startSide, start, paddedBounds, center.y);
    const stopWaypoint = pointOnSide(stop.side, stop.position, paddedBounds, center.y);
    const corner = cornerBetweenSides(startSide, stop.side, paddedBounds, center.y);

    addLineIfNeeded(path, start, startWaypoint);
    addLineIfNeeded(path, startWaypoint, corner);
    addLineIfNeeded(path, corner, stopWaypoint);
    addLineIfNeeded(path, stopWaypoint, stop.position);

    return path;

}

function createDefaultBaseCoordinates() {
    return [
        {x: -6, y: -6},
        {x: 0, y: -6},
        {x: 6, y: -6},
        {x: -6, y: 0},
        {x: 0, y: 0},
        {x: 6, y: 0},
        {x: -6, y: 6},
        {x: 0, y: 6},
        {x: 6, y: 6}
    ];
}

function normalizeBaseCoordinates(baseCoordinates) {
    return baseCoordinates.map(coordinate => ({
        x: coordinate.x,
        z: coordinate.z ?? coordinate.y
    }));
}

function getBounds(coordinates) {
    return coordinates.reduce((bounds, coordinate) => ({
        minX: Math.min(bounds.minX, coordinate.x),
        maxX: Math.max(bounds.maxX, coordinate.x),
        minZ: Math.min(bounds.minZ, coordinate.z),
        maxZ: Math.max(bounds.maxZ, coordinate.z)
    }), {
        minX: Infinity,
        maxX: -Infinity,
        minZ: Infinity,
        maxZ: -Infinity
    });
}

function padBounds(bounds, padding) {
    return {
        minX: bounds.minX - padding,
        maxX: bounds.maxX + padding,
        minZ: bounds.minZ - padding,
        maxZ: bounds.maxZ + padding
    };
}

function pickWorkerStop(coordinates, bounds, height) {
    const candidates = getBoundaryStopCandidates(coordinates, bounds);
    const candidate = candidates[Math.floor(Math.random() * candidates.length)];
    const stopOffset = 3 + Math.random() * 3;
    const sideJitter = (Math.random() - 0.5) * 1.4;
    const x = candidate.x + candidate.normal.x * stopOffset + candidate.tangent.x * sideJitter;
    const z = candidate.z + candidate.normal.z * stopOffset + candidate.tangent.z * sideJitter;

    return {
        side: candidate.side,
        position: new THREE.Vector3(x, height, z)
    };
}

function getBoundaryStopCandidates(coordinates, bounds) {
    const candidates = [];

    coordinates.forEach(coordinate => {
        if (coordinate.x === bounds.minX) {
            candidates.push(createBoundaryCandidate(coordinate, "left"));
        }
        if (coordinate.x === bounds.maxX) {
            candidates.push(createBoundaryCandidate(coordinate, "right"));
        }
        if (coordinate.z === bounds.minZ) {
            candidates.push(createBoundaryCandidate(coordinate, "back"));
        }
        if (coordinate.z === bounds.maxZ) {
            candidates.push(createBoundaryCandidate(coordinate, "front"));
        }
    });

    return candidates;
}

function createBoundaryCandidate(coordinate, side) {
    const normals = {
        left: {x: -1, z: 0},
        right: {x: 1, z: 0},
        back: {x: 0, z: -1},
        front: {x: 0, z: 1}
    };
    const tangents = {
        left: {x: 0, z: 1},
        right: {x: 0, z: 1},
        back: {x: 1, z: 0},
        front: {x: 1, z: 0}
    };

    return {
        x: coordinate.x,
        z: coordinate.z,
        side,
        normal: normals[side],
        tangent: tangents[side]
    };
}

function lineIntersectsBounds(start, end, bounds) {
    const steps = 30;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = THREE.MathUtils.lerp(start.x, end.x, t);
        const z = THREE.MathUtils.lerp(start.z, end.z, t);

        if (x > bounds.minX && x < bounds.maxX && z > bounds.minZ && z < bounds.maxZ) {
            return true;
        }
    }

    return false;
}

function getOutsideSide(point, bounds) {
    const distances = [
        {side: "left", distance: bounds.minX - point.x},
        {side: "right", distance: point.x - bounds.maxX},
        {side: "back", distance: bounds.minZ - point.z},
        {side: "front", distance: point.z - bounds.maxZ}
    ];

    return distances
        .filter(item => item.distance > 0)
        .sort((a, b) => b.distance - a.distance)[0]?.side ?? "front";
}

function pointOnSide(side, point, bounds, height) {
    if (side === "left") {
        return new THREE.Vector3(bounds.minX, height, clamp(point.z, bounds.minZ, bounds.maxZ));
    }
    if (side === "right") {
        return new THREE.Vector3(bounds.maxX, height, clamp(point.z, bounds.minZ, bounds.maxZ));
    }
    if (side === "back") {
        return new THREE.Vector3(clamp(point.x, bounds.minX, bounds.maxX), height, bounds.minZ);
    }

    return new THREE.Vector3(clamp(point.x, bounds.minX, bounds.maxX), height, bounds.maxZ);
}

function cornerBetweenSides(startSide, stopSide, bounds, height) {
    if (startSide === stopSide) {
        return sideCenter(startSide, bounds, height);
    }

    const sideX = startSide === "left" || stopSide === "left" ? bounds.minX : bounds.maxX;
    const sideZ = startSide === "back" || stopSide === "back" ? bounds.minZ : bounds.maxZ;

    return new THREE.Vector3(sideX, height, sideZ);
}

function sideCenter(side, bounds, height) {
    if (side === "left") {
        return new THREE.Vector3(bounds.minX, height, (bounds.minZ + bounds.maxZ) / 2);
    }
    if (side === "right") {
        return new THREE.Vector3(bounds.maxX, height, (bounds.minZ + bounds.maxZ) / 2);
    }
    if (side === "back") {
        return new THREE.Vector3((bounds.minX + bounds.maxX) / 2, height, bounds.minZ);
    }

    return new THREE.Vector3((bounds.minX + bounds.maxX) / 2, height, bounds.maxZ);
}

function addLineIfNeeded(path, start, end) {
    if (start.distanceTo(end) > 0.001) {
        path.add(new THREE.LineCurve3(start, end));
    }
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}



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
