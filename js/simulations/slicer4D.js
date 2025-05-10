// js/simulations/slicer4D.js
import * as THREE from 'three';
import { rotate4DPoint, project4Dto3D, W_PERSPECTIVE_DISTANCE } from '../utils4D.js';
// For robust slicing, you'd need a library for computational geometry (e.g., to find intersections of hyperplanes with polytopes)
// For a simple tesseract, we can pre-calculate or derive the slicing sequence.

let tesseractVertices4D = []; // Original, unrotated tesseract vertices
let animatedMesh; // The 3D mesh representing the current slice
let sliceW = -1.5; // The W-coordinate of our slicing 3D hyperplane
let rotationAngle = 0;

// Export the info object so it can be accessed before initialization
export const info = {
    title: "4D Slicer (Tesseract)",
    description: "Visualizes 3D cross-sections of a tesseract as it passes through our 3D 'space' (a hyperplane at a fixed W coordinate). The tesseract is also slowly rotating in 4D. This is analogous to seeing 2D slices of a 3D object like an MRI scan. Observe how the 3D shape of the slice changes."
};

// Helper to generate tesseract vertices (could be in utils4D too)
function generateTesseractVertices(size) {
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

export function initialize(scene) {
    tesseractVertices4D = generateTesseractVertices(1.5); // Tesseract of size 1.5

    // The animatedMesh will be dynamically updated
    // For a proper slicer, we'd compute the intersection polygons.
    // For this demo, we'll do something simpler: show vertices near the slice plane
    // and connect them if they formed an edge and both parents are on opposite sides of the slice.
    // This is a very simplified approach. A real slicer is much more math-heavy.

    // Let's create a simple placeholder that changes shape/color based on sliceW
    const geometry = new THREE.BoxGeometry(1,1,1); // Placeholder
    const material = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        metalness: 0.3,
        roughness: 0.6,
        transparent: true,
        opacity: 0.8
    });
    animatedMesh = new THREE.Mesh(geometry, material);
    scene.add(animatedMesh);

    // TODO: Implement actual slicing logic. This is non-trivial.
    // The general idea for slicing a polytope:
    // 1. For each edge of the 4D polytope:
    //    - Check if its two vertices are on opposite sides of the slicing hyperplane (e.g., v1.w < sliceW && v2.w > sliceW).
    //    - If so, calculate the 4D intersection point of the edge with the hyperplane. This point will have its w-coordinate equal to sliceW.
    // 2. The collection of these intersection points (which are now 3D points since w=sliceW) forms the vertices of the 3D slice.
    // 3. Connect these 3D vertices to form faces. This requires knowing the face structure of the original 4D polytope.

    // For now, a simpler visual: scale the box based on W, and move it as if it's the COM of the slice
    updateSliceVisuals();

    return { update, cleanup, info };
}

function updateSliceVisuals() {
    // This is a placeholder visualization. A real slicer is much more involved.
    // We'll just change the scale and color of the placeholder cube
    // to represent "something" happening as sliceW changes.

    // Example: let a cube grow and shrink as sliceW moves through the tesseract's extent
    const tesseractCenterW = 0;
    const tesseractHalfWidthW = 1.5 / 2; // for a tesseract of size 1.5

    // Calculate how "much" of the tesseract is at the current sliceW
    // This is a very rough approximation
    const distFromCenter = Math.abs(sliceW - tesseractCenterW);
    let scaleFactor = 1.0 - (distFromCenter / tesseractHalfWidthW);
    scaleFactor = Math.max(0, Math.min(1, scaleFactor)); // Clamp to [0, 1]

    if (animatedMesh) {
        animatedMesh.scale.set(scaleFactor * 1.5, scaleFactor * 1.5, scaleFactor * 1.5);
        animatedMesh.material.color.setHSL(0.5 + (sliceW / 3), 0.8, 0.5); // Color changes with W
        animatedMesh.visible = scaleFactor > 0.01; // Hide if very small
    }
}


function update(deltaTime, time) {
    // Animate the slice plane's W-coordinate
    sliceW = 1.5 * Math.sin(time * 0.3); // Oscillate W between -1.5 and 1.5

    // Optionally, rotate the tesseract in 4D before slicing
    rotationAngle += 0.2 * deltaTime;

    // This is where real slicing logic would go:
    // 1. Rotate tesseractVertices4D using `rotate4DPoint` (e.g., in 'xy' or 'xw' plane).
    // 2. Compute the 3D slice of the rotated tesseract at the current `sliceW`.
    // 3. Update `animatedMesh.geometry` with the new slice polygon(s).

    // For now, just update our placeholder:
    if (animatedMesh) {
        // To make it more interesting, let's project the center of the tesseract
        // (after rotation) and place our placeholder there.
        let center4D = [0,0,0,0];
        center4D = rotate4DPoint(center4D, 'xw', rotationAngle);
        center4D = rotate4DPoint(center4D, 'yz', rotationAngle * 0.7);

        // Project the center, but "imagine" it's on our slice plane (w=0 in projection space)
        // by setting its w to 0 before projection. The actual slicing uses sliceW.
        const projectedCenter = project4Dto3D([center4D[0], center4D[1], center4D[2], 0]);
        animatedMesh.position.copy(projectedCenter);
    }


    updateSliceVisuals(); // Update the placeholder visuals
}

function cleanup(scene) {
    if (animatedMesh) {
        scene.remove(animatedMesh);
        animatedMesh.geometry.dispose();
        animatedMesh.material.dispose();
        animatedMesh = null;
    }
    tesseractVertices4D = [];
}
