function getCssVariable(name) {
    if (typeof window === 'undefined') {
        return '';
    }

    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function cssColor(name) {
    const value = getCssVariable(name);

    if (!value) {
        throw new Error(`Missing CSS color variable: ${name}`);
    }

    return value;
}

function cssColorList(name) {
    const value = getCssVariable(name);

    if (!value) {
        throw new Error(`Missing CSS color list variable: ${name}`);
    }

    const colors = value.split(',').map((color) => color.trim()).filter(Boolean);

    if (colors.length === 0) {
        throw new Error(`CSS color list variable is empty: ${name}`);
    }

    return colors;
}

export const palette = {
    get building() {
        return cssColor('--color-building');
    },
    get floor() {
        return cssColor('--color-floor');
    },
    get grid() {
        return cssColor('--color-grid');
    },
    get accent() {
        return cssColor('--color-accent');
    },
    get sky() {
        return cssColor('--color-sky');
    },
    get void() {
        return cssColor('--color-void');
    },
    get sun() {
        return cssColor('--color-sun');
    },
    get robotCycle() {
        return cssColorList('--color-robot-cycle');
    },
};

function colorCycle(getColors = () => palette.robotCycle) {
    let idx = -1;

    return () => {
        const colors = typeof getColors === 'function' ? getColors() : getColors;
        idx = (idx + 1) % colors.length;
        return colors[idx];
    };
}

export const getNextRobotColor = colorCycle();
