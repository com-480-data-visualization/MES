export const palette = {
    building: 0x0055ff,      // A shade of blue for the building
    floor: 0xcccccc,         // Light grey for the floor plane
    grid: 0xaaaaaa,          // A slightly darker grey for the grid lines
    accent: 0x00ffcc         // The accent color in timeline
};

const ROBOT_COLOR_CYCLE = [
  0xff5500, // orange
  0x00ff55, // green
  0x5500ff, // purple
  0xffff00, // yellow

  0xff0000, // red
  0x00ffff, // cyan
  0xff00ff, // magenta
  0x0000ff, // blue

  0x00ff00, // lime
  0xffa500, // amber/orange
  0x8a2be2, // blue violet
  0x00ced1, // dark turquoise

  0xff69b4, // hot pink
  0x7fff00, // chartreuse
  0x4682b4, // steel blue
  0xdaa520, // goldenrod
];

function colorCycle(colors = ROBOT_COLOR_CYCLE) {
	let idx = -1;
	return () => {
		idx = (idx + 1) % colors.length;
		return colors[idx];
	}
}

export const getNextRobotColor = colorCycle();
