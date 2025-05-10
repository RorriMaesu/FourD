// js/simulations/slicer4D.js
import * as THREE from 'three';
import { BaseSimulation } from './baseSimulation.js';
import { generateTesseractVertices, rotate4DPointN, project4Dto3D } from '../utils/math4D.js';

// For robust slicing, you'd need a library for computational geometry (e.g., to find intersections of hyperplanes with polytopes)
// For a simple tesseract, we can pre-calculate or derive the slicing sequence.

export class Slicer4DSimulation extends BaseSimulation {
    constructor(scene, rendererSize) {
        super(scene, rendererSize);

        this.tesseractVertices4D = []; // Original, unrotated tesseract vertices
        this.animatedMesh = null; // The 3D mesh representing the current slice
        this.sliceW = 0; // The W-coordinate of our slicing 3D hyperplane
        this.sliceSpeed = 0.3; // Speed of slice plane movement
        this.sliceAmplitude = 1.5; // Max distance of slice plane from center
        this.tesseractSize = 1.5; // Size of the tesseract

        // Rotation angles and speeds
        this.angles = { xw: 0, yz: 0 };
        this.rotationSpeeds = { xw: 0.2, yz: 0.14 };

        // Override base info
        this.info = {
            title: "4D Slicer (Tesseract)",
            description: "Visualizes 3D cross-sections of a tesseract as it passes through our 3D 'space' (a hyperplane at a fixed W coordinate). The tesseract is also slowly rotating in 4D. This is analogous to seeing 2D slices of a 3D object like an MRI scan. Observe how the 3D shape of the slice changes."
        };
    }

    initialize() {
        this.generateGeometryData();
        this.createSliceMesh();
        return this;
    }

    generateGeometryData() {
        // Generate tesseract vertices
        this.tesseractVertices4D = generateTesseractVertices(this.tesseractSize);
    }

    createSliceMesh() {
        // For a proper slicer, we'd compute the intersection polygons.
        // For this demo, we'll use a placeholder that changes shape/color based on sliceW

        // Create a mesh with PBR material for better visual quality
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff00ff,
            metalness: 0.5,
            roughness: 0.4,
            transparent: true,
            opacity: 0.8,
            emissive: 0x330033, // Slight glow
        });

        this.animatedMesh = new THREE.Mesh(geometry, material);
        this.group.add(this.animatedMesh);

        // Initial update
        this.updateSliceVisuals();
    }

    updateSliceVisuals() {
        // This is a placeholder visualization. A real slicer is much more involved.
        // We'll just change the scale and color of the placeholder cube
        // to represent "something" happening as sliceW changes.

        const tesseractCenterW = 0;
        const tesseractHalfWidthW = this.tesseractSize / 2;

        // Calculate how "much" of the tesseract is at the current sliceW
        // This is a very rough approximation
        const distFromCenter = Math.abs(this.sliceW - tesseractCenterW);
        let scaleFactor = 1.0 - (distFromCenter / tesseractHalfWidthW);
        scaleFactor = Math.max(0, Math.min(1, scaleFactor)); // Clamp to [0, 1]

        if (this.animatedMesh) {
            this.animatedMesh.scale.set(
                scaleFactor * this.tesseractSize,
                scaleFactor * this.tesseractSize,
                scaleFactor * this.tesseractSize
            );

            // Color changes with W - use a more sophisticated color scheme
            const hue = 0.5 + (this.sliceW / 3);
            const saturation = 0.8;
            const lightness = 0.5;
            this.animatedMesh.material.color.setHSL(hue, saturation, lightness);

            // Also update emissive color for a glow effect
            const emissiveIntensity = scaleFactor * 0.2;
            this.animatedMesh.material.emissive.setHSL(hue, saturation, emissiveIntensity);

            // Hide if very small
            this.animatedMesh.visible = scaleFactor > 0.01;
        }
    }

    update(deltaTime, time, uiParams = {}) {
        super.update(deltaTime, time, uiParams);

        // Update slice parameters from UI if provided
        this.sliceSpeed = uiParams.sliceSpeed ?? this.sliceSpeed;
        this.sliceAmplitude = uiParams.sliceAmplitude ?? this.sliceAmplitude;

        // Update rotation angles
        this.angles.xw += (uiParams.rotationSpeeds?.xw ?? this.rotationSpeeds.xw) * deltaTime;
        this.angles.yz += (uiParams.rotationSpeeds?.yz ?? this.rotationSpeeds.yz) * deltaTime;

        // Animate the slice plane's W-coordinate
        this.sliceW = this.sliceAmplitude * Math.sin(time * this.sliceSpeed);

        // For a real slicer, this is where we would:
        // 1. Rotate the tesseract vertices in 4D
        // 2. Compute the 3D slice of the rotated tesseract at the current sliceW
        // 3. Update the mesh geometry with the new slice

        // For now, just update our placeholder:
        if (this.animatedMesh) {
            // Rotate the center of the tesseract in 4D and project it
            let center4D = [0, 0, 0, 0];
            center4D = rotate4DPointN(center4D, this.angles);

            // Project the center, but "imagine" it's on our slice plane
            const projectedCenter = project4Dto3D([center4D[0], center4D[1], center4D[2], 0]);
            this.animatedMesh.position.copy(projectedCenter);
        }

        // Update the visual representation of the slice
        this.updateSliceVisuals();
    }

    getUIControls() {
        return [
            {
                type: 'slider',
                id: 'sliceSpeed',
                label: 'Slice Speed',
                min: 0.05,
                max: 1,
                step: 0.05,
                defaultValue: this.sliceSpeed
            },
            {
                type: 'slider',
                id: 'sliceAmplitude',
                label: 'Slice Amplitude',
                min: 0.5,
                max: 3,
                step: 0.1,
                defaultValue: this.sliceAmplitude
            },
            {
                type: 'slider',
                id: 'rotationSpeeds.xw',
                label: 'XW Rotation Speed',
                min: -0.5,
                max: 0.5,
                step: 0.01,
                defaultValue: this.rotationSpeeds.xw
            },
            {
                type: 'slider',
                id: 'rotationSpeeds.yz',
                label: 'YZ Rotation Speed',
                min: -0.5,
                max: 0.5,
                step: 0.01,
                defaultValue: this.rotationSpeeds.yz
            }
        ];
    }
}

// For backward compatibility
export const info = {
    title: "4D Slicer (Tesseract)",
    description: "Visualizes 3D cross-sections of a tesseract as it passes through our 3D 'space' (a hyperplane at a fixed W coordinate). The tesseract is also slowly rotating in 4D. This is analogous to seeing 2D slices of a 3D object like an MRI scan. Observe how the 3D shape of the slice changes."
};

export function initialize(scene, rendererSize) {
    const simulation = new Slicer4DSimulation(scene, rendererSize);
    simulation.initialize();

    return {
        update: (deltaTime, time, rendererSize) => simulation.update(deltaTime, time, { rendererSize }),
        cleanup: () => simulation.cleanup(),
        info: simulation.info
    };
}
