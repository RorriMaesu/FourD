// js/simulations/tesseract.js
import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { BaseSimulation } from './baseSimulation.js';
import { generateTesseractVertices, generateHypercubeEdges, rotate4DPointN, project4Dto3D } from '../utils/math4D.js';

const TESSERACT_SIZE = 1.5;

export class TesseractSimulation extends BaseSimulation {
    constructor(scene, rendererSize) {
        super(scene, rendererSize);

        this.points4D = [];
        this.edges = [];
        this.projectedPoints3D = [];
        this.lineMesh = null;
        this.vertexMeshes = [];

        // Rotation angles and speeds
        this.angles = { xw: 0, yz: 0, zw: 0, xy: 0 };
        this.rotationSpeeds = { xw: 0.5, yz: 0.7, zw: 0.3, xy: 0.1 };
        this.wPerspectiveDistance = 4.0;

        // Override base info
        this.info = {
            title: "Tesseract Explorer",
            description: "A 4-dimensional hypercube (tesseract) projected into 3D space. Control its rotation in 6 different 4D planes. Observe how it appears to turn 'inside out' – a characteristic of 4D rotation. Edges and vertices are rendered with high-quality materials."
        };
    }

    initialize() {
        this.generateGeometryData();
        this.createThreeObject();
        return this;
    }

    generateGeometryData() {
        // Generate tesseract vertices
        this.points4D = generateTesseractVertices(TESSERACT_SIZE);

        // Generate edges between vertices
        this.edges = generateHypercubeEdges(this.points4D);

        // Initial projection to 3D
        this.projectedPoints3D = this.points4D.map(p => project4Dto3D(p, this.wPerspectiveDistance));
    }

    createThreeObject() {
        // Create edges with LineMaterial for high-quality lines
        const linePositions = [];
        this.edges.forEach(edge => {
            linePositions.push(
                ...this.projectedPoints3D[edge[0]].toArray(),
                ...this.projectedPoints3D[edge[1]].toArray()
            );
        });

        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions(linePositions);

        this.lineMaterial = new LineMaterial({
            color: 0x00ddff,
            linewidth: 0.0035, // In world units
            transparent: true,
            opacity: 0.9,
            dashed: false,
        });
        this.lineMaterial.resolution.set(this.rendererSize.width, this.rendererSize.height);

        this.lineMesh = new Line2(lineGeometry, this.lineMaterial);
        this.lineMesh.computeLineDistances();
        this.group.add(this.lineMesh);

        // Create vertices with PBR material
        const vertexGeometry = new THREE.SphereGeometry(0.05, 16, 12);
        const vertexMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            metalness: 0.6,
            roughness: 0.3,
            emissive: 0x221100, // Slight glow
        });

        this.vertexMeshes = [];
        for (let i = 0; i < this.points4D.length; i++) {
            const vertexMesh = new THREE.Mesh(vertexGeometry, vertexMaterial.clone());
            vertexMesh.position.copy(this.projectedPoints3D[i]);
            this.vertexMeshes.push(vertexMesh);
            this.group.add(vertexMesh);
        }
    }

    update(deltaTime, time, uiParams = {}) {
        super.update(deltaTime, time, uiParams);

        // Update rotation angles from UI parameters or use default speeds
        this.angles.xw += (uiParams.rotationSpeeds?.xw ?? this.rotationSpeeds.xw) * deltaTime;
        this.angles.yz += (uiParams.rotationSpeeds?.yz ?? this.rotationSpeeds.yz) * deltaTime;
        this.angles.zw += (uiParams.rotationSpeeds?.zw ?? this.rotationSpeeds.zw) * deltaTime;
        this.angles.xy += (uiParams.rotationSpeeds?.xy ?? this.rotationSpeeds.xy) * deltaTime;

        // Update W perspective distance if provided
        this.wPerspectiveDistance = uiParams.wPerspectiveDistance ?? this.wPerspectiveDistance;

        // Rotate and project points
        this.projectedPoints3D = [];
        const linePositions = [];

        this.points4D.forEach((p4_orig, index) => {
            // Rotate the point in 4D
            const p4 = rotate4DPointN([...p4_orig], this.angles);

            // Project to 3D
            const p3 = project4Dto3D(p4, this.wPerspectiveDistance);
            this.projectedPoints3D.push(p3);

            // Update vertex position
            this.vertexMeshes[index].position.copy(p3);

            // Color vertex based on W coordinate
            const w_norm = (p4[3] + TESSERACT_SIZE/2) / TESSERACT_SIZE;
            this.vertexMeshes[index].material.color.setHSL(0.08 + w_norm * 0.05, 0.9, 0.5);
        });

        // Update line positions
        this.edges.forEach(edge => {
            linePositions.push(
                ...this.projectedPoints3D[edge[0]].toArray(),
                ...this.projectedPoints3D[edge[1]].toArray()
            );
        });

        this.lineMesh.geometry.setPositions(linePositions);
        this.lineMesh.computeLineDistances();
    }

    onResize(newRendererSize) {
        super.onResize(newRendererSize);
        if (this.lineMaterial) {
            this.lineMaterial.resolution.set(newRendererSize.width, newRendererSize.height);
        }
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
                id: 'rotationSpeeds.yz',
                label: 'YZ Rotation Speed',
                min: -1,
                max: 1,
                step: 0.01,
                defaultValue: this.rotationSpeeds.yz
            },
            {
                type: 'slider',
                id: 'rotationSpeeds.zw',
                label: 'ZW Rotation Speed',
                min: -1,
                max: 1,
                step: 0.01,
                defaultValue: this.rotationSpeeds.zw
            },
            {
                type: 'slider',
                id: 'rotationSpeeds.xy',
                label: 'XY Rotation Speed',
                min: -1,
                max: 1,
                step: 0.01,
                defaultValue: this.rotationSpeeds.xy
            },
            {
                type: 'slider',
                id: 'wPerspectiveDistance',
                label: 'W Perspective Distance',
                min: 1,
                max: 10,
                step: 0.1,
                defaultValue: this.wPerspectiveDistance
            }
        ];
    }
}

// For backward compatibility
export const info = {
    title: "Tesseract Explorer",
    description: "A 4-dimensional hypercube (tesseract) projected into 3D space. Control its rotation in 6 different 4D planes. Observe how it appears to turn 'inside out' – a characteristic of 4D rotation. Edges and vertices are rendered with high-quality materials."
};

export function initialize(scene, rendererSize) {
    const simulation = new TesseractSimulation(scene, rendererSize);
    simulation.initialize();

    return {
        update: (deltaTime, time, rendererSize) => simulation.update(deltaTime, time, { rendererSize }),
        cleanup: () => simulation.cleanup(),
        info: simulation.info
    };
}
