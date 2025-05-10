# Interactive 4D Visualization Suite

A comprehensive suite of interactive 4D visualizations projected into 3D space, built with Three.js.

## Description

This project provides multiple interactive visualizations to help understand 4D geometry:

1. **Rotating Tesseract**: A 4D hypercube rotating in multiple 4D planes
2. **Hypersphere Point Cloud**: A 3-sphere (glome) represented as points on its 4D surface
3. **4D Slicer**: Visualizing 3D cross-sections of a 4D object as it passes through our 3D space

## Features

- Real-time 4D to 3D projection with perspective
- Interactive 3D camera controls (drag to rotate, scroll to zoom)
- Multiple 4D rotation planes (XW, YZ, ZW, etc.)
- Stunning visuals with post-processing effects
- Clean, modern UI with simulation descriptions
- Modular architecture for easy addition of new 4D visualizations

## Live Demo

Visit the [live demo](https://RorriMaesu.github.io/FourD/) to explore the 4D visualizations.

## Technologies Used

- HTML5 & CSS3
- JavaScript (ES6+)
- Three.js for 3D rendering
- Post-processing with EffectComposer and UnrealBloomPass
- Advanced line rendering with Line2 and LineMaterial

## How It Works

Each visualization demonstrates different aspects of 4D geometry:

### Tesseract
- Generates the 16 vertices and 32 edges of a 4D hypercube
- Applies simultaneous rotations in multiple 4D planes
- Projects the rotated 4D points into 3D using perspective projection
- Renders with thick, glowing lines for better visualization

### Hypersphere
- Creates points uniformly distributed on the surface of a 4D sphere
- Rotates the points in 4D space
- Colors each point based on its W-coordinate to provide visual depth
- Demonstrates how points appear to emerge from and recede into a central region

### 4D Slicer
- Shows 3D cross-sections of a 4D object (analogous to MRI slices of a 3D object)
- Animates the slice plane moving through the 4D object
- Visualizes how the 3D shape changes as the slice moves through the 4D space

## Support This Project

If you find this project helpful or educational, consider buying me a coffee!

<a href="https://buymeacoffee.com/rorrimaesu" target="_blank">
  <img src="assets/buymeacoffee.svg" alt="Buy Me A Coffee" width="210" height="60">
</a>

## License

MIT License
