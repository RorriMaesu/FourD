// js/simulations/hyperSphere.js
import * as THREE from 'three';
import { rotate4DPoint, project4Dto3D } from '../utils4D.js';

const RADIUS = 2;
const NUM_POINTS = 2000; // More points = denser sphere, more performance cost
let points4D = [];
let pointCloud;
let angleXW = 0, angleYW = 0;

const info = {
    title: "Hypersphere Point Cloud",
    description: "A 3-sphere (or glome) is the 4D analogue of a sphere. This visualization shows a cloud of points on its 'surface', projected into 3D. It's rotating in the XW and YW planes. Notice how points seem to emerge from and recede into a central region as they pass through the 'W' dimension relative to our 3D projection space."
};


function generatePointsOnHyperSphere() {
    points4D = [];
    for (let i = 0; i < NUM_POINTS; i++) {
        // Generate random points in 4D using Gaussian distribution, then normalize
        // This gives a uniform distribution on the surface of a hypersphere
        let x = Math.random() * 2 - 1; // Quick way for demo, better is Box-Muller
        let y = Math.random() * 2 - 1;
        let z = Math.random() * 2 - 1;
        let w = Math.random() * 2 - 1;
        
        // A more robust way for uniform points on n-sphere (using Gaussian samples):
        x = randn_bm(); y = randn_bm(); z = randn_bm(); w = randn_bm();

        const R = Math.sqrt(x*x + y*y + z*z + w*w);
        if (R === 0) continue; // Avoid division by zero

        points4D.push([
            (x / R) * RADIUS,
            (y / R) * RADIUS,
            (z / R) * RADIUS,
            (w / R) * RADIUS
        ]);
    }
}

// Standard Normal variate using Box-Muller transform
function randn_bm() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}


export function initialize(scene) {
    generatePointsOnHyperSphere();

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(NUM_POINTS * 3);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Color points by their W coordinate for visual depth
    const colors = new Float32Array(NUM_POINTS * 3);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        // blending: THREE.AdditiveBlending, // For a brighter look
        // map: createCircleTexture() // For softer points
    });

    pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    updatePoints(0); // Initial projection

    return { update, cleanup, info };
}

function updatePoints(time) {
    const positions = pointCloud.geometry.attributes.position.array;
    const colors = pointCloud.geometry.attributes.color.array;
    const color = new THREE.Color();

    for (let i = 0; i < points4D.length; i++) {
        let p4 = points4D[i];
        p4 = rotate4DPoint(p4, 'xw', angleXW + time * 0.1);
        p4 = rotate4DPoint(p4, 'yw', angleYW + time * 0.15);
        
        const p3 = project4Dto3D(p4);
        positions[i * 3] = p3.x;
        positions[i * 3 + 1] = p3.y;
        positions[i * 3 + 2] = p3.z;

        // Color based on W coordinate (after rotation)
        // Map W from [-RADIUS, RADIUS] to [0, 1] for color interpolation
        const w_normalized = (p4[3] + RADIUS) / (2 * RADIUS);
        color.setHSL(0.6 + w_normalized * 0.4, 0.8, 0.3 + w_normalized * 0.4); // Blues to purples/pinks
        colors[i*3] = color.r;
        colors[i*3+1] = color.g;
        colors[i*3+2] = color.b;
    }
    pointCloud.geometry.attributes.position.needsUpdate = true;
    pointCloud.geometry.attributes.color.needsUpdate = true;
}


function update(deltaTime, time) {
    angleXW += 0.3 * deltaTime;
    angleYW += 0.2 * deltaTime;
    updatePoints(time); // Pass global time for consistent slow passive rotation if desired
}

function cleanup(scene) {
    if (pointCloud) {
        scene.remove(pointCloud);
        pointCloud.geometry.dispose();
        pointCloud.material.dispose();
        pointCloud = null;
    }
    points4D = [];
}
