// js/simulations/tesseract.js
import * as THREE from 'three';
import { rotate4DPoint, project4Dto3D, generateHypercubeEdges } from '../utils4D.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';


const TESSERACT_SIZE = 1.5;
let points4D = [];
let edges = [];
let projectedPoints3D = [];
let lineMesh;

let angleXW = 0;
let angleYZ = 0;
let angleZW = 0;

// Export the info object so it can be accessed before initialization
export const info = {
    title: "Rotating Tesseract",
    description: "A 4-dimensional hypercube (tesseract) projected into 3D space. It's rotating in the XW, YZ, and ZW 4D planes. Observe how the 'inner' cube appears to turn 'inside out' without passing through the faces of the 'outer' cube – a characteristic of 4D rotation."
};

function generateVertices() {
    points4D = [];
    for (let i = 0; i < 16; i++) {
        points4D.push([
            (i & 1 ? 1 : -1) * TESSERACT_SIZE / 2,
            (i & 2 ? 1 : -1) * TESSERACT_SIZE / 2,
            (i & 4 ? 1 : -1) * TESSERACT_SIZE / 2,
            (i & 8 ? 1 : -1) * TESSERACT_SIZE / 2
        ]);
    }
}

export function initialize(scene, rendererSize) {
    generateVertices();
    edges = generateHypercubeEdges(points4D);
    projectedPoints3D = points4D.map(p => project4Dto3D(p));

    const positions = [];
    edges.forEach(edge => {
        positions.push(...projectedPoints3D[edge[0]].toArray());
        positions.push(...projectedPoints3D[edge[1]].toArray());
    });

    const lineGeometry = new LineGeometry();
    lineGeometry.setPositions(positions);

    const lineMaterial = new LineMaterial({
        color: 0x00ffff, // Cyan
        linewidth: 0.003, // in world units. Adjust based on your scene scale
        dashed: false,
        transparent: true,
        opacity: 0.8,
    });
    lineMaterial.resolution.set(rendererSize.width, rendererSize.height); // for correct linewidth

    lineMesh = new Line2(lineGeometry, lineMaterial);
    lineMesh.computeLineDistances(); // Important for LineMaterial
    lineMesh.scale.set(1, 1, 1);
    scene.add(lineMesh);

    return { update, cleanup, info };
}

function update(deltaTime, time, rendererSize) {
    angleXW += 0.5 * deltaTime;
    angleYZ += 0.7 * deltaTime;
    angleZW += 0.3 * deltaTime;

    projectedPoints3D = [];
    for (let i = 0; i < points4D.length; i++) {
        let p = points4D[i];
        p = rotate4DPoint(p, 'xw', angleXW);
        p = rotate4DPoint(p, 'yz', angleYZ);
        p = rotate4DPoint(p, 'zw', angleZW);
        projectedPoints3D.push(project4Dto3D(p));
    }

    const positions = [];
    edges.forEach(edge => {
        positions.push(...projectedPoints3D[edge[0]].toArray());
        positions.push(...projectedPoints3D[edge[1]].toArray());
    });
    lineMesh.geometry.setPositions(positions);
    lineMesh.computeLineDistances();
    lineMesh.material.resolution.set(rendererSize.width, rendererSize.height); // Update resolution if window resizes
}

function cleanup(scene) {
    if (lineMesh) {
        scene.remove(lineMesh);
        lineMesh.geometry.dispose();
        lineMesh.material.dispose();
        lineMesh = null;
    }
    points4D = [];
    edges = [];
    projectedPoints3D = [];
}
