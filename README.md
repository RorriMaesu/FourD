# 4D Tesseract Animation

An interactive visualization of a 4D hypercube (tesseract) projected into 3D space, built with Three.js.

## Description

This project visualizes a 4D hypercube (tesseract) by:
1. Creating the 16 vertices and 32 edges of a 4D hypercube
2. Applying 4D rotations in various planes (XW, YZ, ZW)
3. Projecting the 4D object into 3D space using perspective projection
4. Rendering the result with Three.js

## Features

- Real-time 4D to 3D projection
- Interactive 3D camera controls (drag to rotate, scroll to zoom)
- Smooth animations with multiple rotation planes
- Clean, modern visual style with glowing edges

## Live Demo

Visit the [live demo](https://RorriMaesu.github.io/FourD/) to see the tesseract in action.

## Technologies Used

- HTML5
- JavaScript
- Three.js for 3D rendering

## How It Works

The visualization works by:
1. Defining the 16 vertices of a 4D hypercube
2. Creating edges between vertices that differ in exactly one coordinate
3. Applying 4D rotations to the vertices
4. Projecting the rotated 4D points into 3D using perspective projection
5. Rendering the projected structure using Three.js

## License

MIT License
