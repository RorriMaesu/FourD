// js/utils/math4D.js
import * as THREE from 'three';

export const W_PERSPECTIVE_DISTANCE = 4; // Default distance for 4D to 3D projection

/**
 * Rotates a 4D point (array [x, y, z, w]) in a specified 4D plane.
 * Planes: 'xy', 'xz', 'xw', 'yz', 'yw', 'zw'
 */
export function rotate4DPoint(point4D, plane, angle) {
    let [x, y, z, w] = point4D;
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    switch (plane) {
        case 'xy': return [x * c - y * s, x * s + y * c, z, w];
        case 'xz': return [x * c - z * s, y, x * s + z * c, w];
        case 'xw': return [x * c - w * s, y, z, x * s + w * c];
        case 'yz': return [x, y * c - z * s, y * s + z * c, w];
        case 'yw': return [x, y * c - w * s, z, y * s + w * c];
        case 'zw': return [x, y, z * c - w * s, z * s + w * c];
        default:   return point4D;
    }
}

/**
 * Rotates a 4D point using multiple angles stored in an angles object
 * @param {Array} point4D - [x, y, z, w] coordinates
 * @param {Object} angles - Object with rotation angles for different planes (e.g., {xy: 0.1, xw: 0.2})
 * @returns {Array} Rotated 4D point
 */
export function rotate4DPointN(point4D, angles) {
    let result = [...point4D]; // Clone the point
    
    // Apply rotations in a specific order (can be customized)
    if (angles.xy) result = rotate4DPoint(result, 'xy', angles.xy);
    if (angles.xz) result = rotate4DPoint(result, 'xz', angles.xz);
    if (angles.yz) result = rotate4DPoint(result, 'yz', angles.yz);
    if (angles.xw) result = rotate4DPoint(result, 'xw', angles.xw);
    if (angles.yw) result = rotate4DPoint(result, 'yw', angles.yw);
    if (angles.zw) result = rotate4DPoint(result, 'zw', angles.zw);
    
    return result;
}

/**
 * Projects a 4D point (array [x, y, z, w]) to a 3D THREE.Vector3.
 * Uses perspective projection.
 */
export function project4Dto3D(point4D, w_distance = W_PERSPECTIVE_DISTANCE) {
    const [x, y, z, w] = point4D;
    const divisor = w_distance - w + 0.00001; // Add epsilon to avoid division by zero
    const scaleFactor = w_distance; // Or some other factor if needed

    // If divisor is close to zero or negative, point is "behind" or at projection viewpoint.
    // Clamp or handle this to avoid extreme values. A large value will push it far away.
    if (divisor <= 0.01) {
        const largeVal = 10000;
        return new THREE.Vector3(
            Math.sign(x) * largeVal,
            Math.sign(y) * largeVal,
            Math.sign(z) * largeVal
        );
    }
    
    return new THREE.Vector3(
        (x * scaleFactor) / divisor,
        (y * scaleFactor) / divisor,
        (z * scaleFactor) / divisor
    );
}

/**
 * Creates edges for an n-hypercube (generalized for n-dimensions, useful for tesseract).
 * Vertices should be generated such that coordinates are -0.5 or 0.5 (or -size/2, size/2).
 */
export function generateHypercubeEdges(vertices4D) {
    const edges = [];
    for (let i = 0; i < vertices4D.length; i++) {
        for (let j = i + 1; j < vertices4D.length; j++) {
            let diffCount = 0;
            if (Math.abs(vertices4D[i][0] - vertices4D[j][0]) > 1e-4) diffCount++;
            if (Math.abs(vertices4D[i][1] - vertices4D[j][1]) > 1e-4) diffCount++;
            if (Math.abs(vertices4D[i][2] - vertices4D[j][2]) > 1e-4) diffCount++;
            if (Math.abs(vertices4D[i][3] - vertices4D[j][3]) > 1e-4) diffCount++;
            
            if (diffCount === 1) {
                edges.push([i, j]);
            }
        }
    }
    return edges;
}

/**
 * Generates vertices for a 4D hypercube (tesseract)
 * @param {number} size - Size of the tesseract
 * @returns {Array} Array of 4D points [x,y,z,w]
 */
export function generateTesseractVertices(size) {
    const vertices = [];
    for (let i = 0; i < 16; i++) {
        vertices.push([
            (i & 1 ? 1 : -1) * size / 2,
            (i & 2 ? 1 : -1) * size / 2,
            (i & 4 ? 1 : -1) * size / 2,
            (i & 8 ? 1 : -1) * size / 2
        ]);
    }
    return vertices;
}

/**
 * Generates vertices for a 4D hypersphere (glome)
 * @param {number} radius - Radius of the hypersphere
 * @param {number} numPoints - Number of points to generate
 * @returns {Array} Array of 4D points [x,y,z,w] on the hypersphere
 */
export function generateHypersphereVertices(radius, numPoints) {
    const vertices = [];
    for (let i = 0; i < numPoints; i++) {
        // Generate random points using Gaussian distribution
        const x = randn_bm();
        const y = randn_bm();
        const z = randn_bm();
        const w = randn_bm();
        
        // Normalize to place on hypersphere surface
        const r = Math.sqrt(x*x + y*y + z*z + w*w);
        if (r === 0) continue; // Avoid division by zero
        
        vertices.push([
            (x / r) * radius,
            (y / r) * radius,
            (z / r) * radius,
            (w / r) * radius
        ]);
    }
    return vertices;
}

// Standard Normal variate using Box-Muller transform
function randn_bm() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}
