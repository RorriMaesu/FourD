// js/utils4D.js
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
