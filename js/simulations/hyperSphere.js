// js/simulations/hyperSphere.js
import * as THREE from 'three';
import { BaseSimulation } from './baseSimulation.js';
import { generateHypersphereVertices, rotate4DPointN, project4Dto3D } from '../utils/math4D.js';

const RADIUS = 2;
const NUM_POINTS = 2000; // More points = denser sphere, more performance cost

export class HyperSphereSimulation extends BaseSimulation {
    constructor(scene, rendererSize) {
        super(scene, rendererSize);

        this.points4D = [];
        this.pointCloud = null;
        this.angles = { xw: 0, yw: 0 };
        this.rotationSpeeds = { xw: 0.3, yw: 0.2 };
        this.wPerspectiveDistance = 4.0;
        this.pointSize = 0.05;
        this.useAdditiveBlending = false;

        // Override base info
        this.info = {
            title: "Hypersphere Point Cloud",
            description: "A 3-sphere (or glome) is the 4D analogue of a sphere. This visualization shows a cloud of points on its 'surface', projected into 3D. It's rotating in the XW and YW planes. Notice how points seem to emerge from and recede into a central region as they pass through the 'W' dimension relative to our 3D projection space."
        };
    }

    initialize() {
        this.generateGeometryData();
        this.createThreeObject();
        return this;
    }

    generateGeometryData() {
        // Generate points on the hypersphere
        this.points4D = generateHypersphereVertices(RADIUS, NUM_POINTS);
    }

    createThreeObject() {
        // Create buffer geometry for point cloud
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(NUM_POINTS * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Color points by their W coordinate for visual depth
        const colors = new Float32Array(NUM_POINTS * 3);
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Create point material with enhanced visual properties
        const material = new THREE.PointsMaterial({
            size: this.pointSize,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: this.useAdditiveBlending ? THREE.AdditiveBlending : THREE.NormalBlending,
            // For softer points, we could use a texture
            // map: this.createCircleTexture()
        });

        this.pointCloud = new THREE.Points(geometry, material);
        this.group.add(this.pointCloud);

        // Initial update to position points
        this.updatePoints(0);
    }

    updatePoints(time) {
        if (!this.pointCloud) return;

        const positions = this.pointCloud.geometry.attributes.position.array;
        const colors = this.pointCloud.geometry.attributes.color.array;
        const color = new THREE.Color();

        for (let i = 0; i < this.points4D.length; i++) {
            // Apply 4D rotations
            const p4 = rotate4DPointN([...this.points4D[i]], {
                xw: this.angles.xw + time * 0.1,
                yw: this.angles.yw + time * 0.15
            });

            // Project to 3D
            const p3 = project4Dto3D(p4, this.wPerspectiveDistance);
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

        this.pointCloud.geometry.attributes.position.needsUpdate = true;
        this.pointCloud.geometry.attributes.color.needsUpdate = true;
    }

    update(deltaTime, time, uiParams = {}) {
        super.update(deltaTime, time, uiParams);

        // Update rotation angles
        this.angles.xw += (uiParams.rotationSpeeds?.xw ?? this.rotationSpeeds.xw) * deltaTime;
        this.angles.yw += (uiParams.rotationSpeeds?.yw ?? this.rotationSpeeds.yw) * deltaTime;

        // Update W perspective distance if provided
        this.wPerspectiveDistance = uiParams.wPerspectiveDistance ?? this.wPerspectiveDistance;

        // Update point size if provided
        if (uiParams.pointSize !== undefined && this.pointCloud) {
            this.pointSize = uiParams.pointSize;
            this.pointCloud.material.size = this.pointSize;
        }

        // Update additive blending if provided
        if (uiParams.useAdditiveBlending !== undefined && this.pointCloud) {
            this.useAdditiveBlending = uiParams.useAdditiveBlending;
            this.pointCloud.material.blending = this.useAdditiveBlending ?
                THREE.AdditiveBlending : THREE.NormalBlending;
        }

        // Update point positions and colors
        this.updatePoints(time);
    }

    // Optional: Create a circular texture for softer points
    createCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');

        // Draw a circle
        context.beginPath();
        context.arc(32, 32, 30, 0, 2 * Math.PI);
        context.fillStyle = 'white';
        context.fill();

        // Create a texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    getUIControls() {
        return [
            {
                type: 'slider',
                id: 'rotationSpeeds.xw',
                label: 'XW Rotation Speed',
                min: -1,
                max: 1,
                step: 0.01,
                defaultValue: this.rotationSpeeds.xw
            },
            {
                type: 'slider',
                id: 'rotationSpeeds.yw',
                label: 'YW Rotation Speed',
                min: -1,
                max: 1,
                step: 0.01,
                defaultValue: this.rotationSpeeds.yw
            },
            {
                type: 'slider',
                id: 'wPerspectiveDistance',
                label: 'W Perspective Distance',
                min: 1,
                max: 10,
                step: 0.1,
                defaultValue: this.wPerspectiveDistance
            },
            {
                type: 'slider',
                id: 'pointSize',
                label: 'Point Size',
                min: 0.01,
                max: 0.2,
                step: 0.01,
                defaultValue: this.pointSize
            },
            {
                type: 'checkbox',
                id: 'useAdditiveBlending',
                label: 'Use Additive Blending',
                defaultValue: this.useAdditiveBlending
            }
        ];
    }
}

// For backward compatibility
export const info = {
    title: "Hypersphere Point Cloud",
    description: "A 3-sphere (or glome) is the 4D analogue of a sphere. This visualization shows a cloud of points on its 'surface', projected into 3D. It's rotating in the XW and YW planes. Notice how points seem to emerge from and recede into a central region as they pass through the 'W' dimension relative to our 3D projection space."
};

export function initialize(scene, rendererSize) {
    const simulation = new HyperSphereSimulation(scene, rendererSize);
    simulation.initialize();

    return {
        update: (deltaTime, time, rendererSize) => simulation.update(deltaTime, time, { rendererSize }),
        cleanup: () => simulation.cleanup(),
        info: simulation.info
    };
}
