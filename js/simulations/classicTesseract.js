// js/simulations/classicTesseract.js
import * as THREE from 'three';
import { BaseSimulation } from './baseSimulation.js';
import { rotate4DPoint, project4Dto3D } from '../utils/math4D.js';

// This is a classic implementation of the tesseract visualization
// It uses the original approach from the main.js file

const TESSERACT_SIZE = 1.5;

export class ClassicTesseractSimulation extends BaseSimulation {
    constructor(scene, rendererSize) {
        super(scene, rendererSize);
        
        this.points4D = [];
        this.edges = [];
        this.projectedPoints3D = [];
        this.lines = null;
        
        // Rotation angles
        this.angleXW = 0;
        this.angleYZ = 0;
        this.angleXY = 0;
        this.angleZW = 0;
        
        // Rotation speeds
        this.rotationSpeeds = {
            xw: 0.005,
            yz: 0.007,
            xy: 0.002,
            zw: 0.003
        };
        
        this.perspectiveDistance = 4;
        
        // Override base info
        this.info = {
            title: "Classic Tesseract",
            description: "The original tesseract visualization from the first implementation. A 4-dimensional hypercube (tesseract) projected into 3D space. It's rotating in multiple 4D planes. Observe how the 'inner' cube appears to turn 'inside out' without passing through the faces of the 'outer' cube."
        };
    }
    
    initialize() {
        this.createHypercubeVertices();
        this.createHypercubeEdges();
        this.projectAndDrawHypercube();
        return this;
    }
    
    createHypercubeVertices() {
        this.points4D = [];
        for (let i = 0; i < 16; i++) {
            // Generate 4D coordinates (+/- tesseractSize/2 for each dimension)
            // This is like counting in binary from 0000 to 1111
            const x = (i & 1 ? 1 : -1) * TESSERACT_SIZE / 2;
            const y = (i & 2 ? 1 : -1) * TESSERACT_SIZE / 2;
            const z = (i & 4 ? 1 : -1) * TESSERACT_SIZE / 2;
            const w = (i & 8 ? 1 : -1) * TESSERACT_SIZE / 2;
            this.points4D.push([x, y, z, w]);
        }
    }
    
    createHypercubeEdges() {
        this.edges = [];
        for (let i = 0; i < 16; i++) {
            for (let j = i + 1; j < 16; j++) {
                // Connect vertices if they differ in exactly one coordinate (Hamming distance 1)
                let diffCount = 0;
                if (this.points4D[i][0] !== this.points4D[j][0]) diffCount++;
                if (this.points4D[i][1] !== this.points4D[j][1]) diffCount++;
                if (this.points4D[i][2] !== this.points4D[j][2]) diffCount++;
                if (this.points4D[i][3] !== this.points4D[j][3]) diffCount++;
                
                if (diffCount === 1) {
                    this.edges.push([i, j]);
                }
            }
        }
    }
    
    rotate4D(point4D, angleXW, angleYZ, angleXY, angleZW) {
        let [x, y, z, w] = point4D;
        let newX, newY, newZ, newW;

        // XY rotation
        if (angleXY !== 0) {
            newX = x * Math.cos(angleXY) - y * Math.sin(angleXY);
            newY = x * Math.sin(angleXY) + y * Math.cos(angleXY);
            x = newX; y = newY;
        }

        // XW rotation
        if (angleXW !== 0) {
            newX = x * Math.cos(angleXW) - w * Math.sin(angleXW);
            newW = x * Math.sin(angleXW) + w * Math.cos(angleXW);
            x = newX; w = newW;
        }

        // YZ rotation
        if (angleYZ !== 0) {
            newY = y * Math.cos(angleYZ) - z * Math.sin(angleYZ);
            newZ = y * Math.sin(angleYZ) + z * Math.cos(angleYZ);
            y = newY; z = newZ;
        }
        
        // ZW rotation
        if (angleZW !== 0) {
            newZ = z * Math.cos(angleZW) - w * Math.sin(angleZW);
            newW = z * Math.sin(angleZW) + w * Math.cos(angleZW);
            z = newZ; w = newW;
        }

        return [x, y, z, w];
    }
    
    projectAndDrawHypercube() {
        this.projectedPoints3D = [];
        for (let i = 0; i < this.points4D.length; i++) {
            const rotatedPoint = this.rotate4D(
                this.points4D[i], 
                this.angleXW, 
                this.angleYZ, 
                this.angleXY, 
                this.angleZW
            );
            this.projectedPoints3D.push(project4Dto3D(rotatedPoint, this.perspectiveDistance));
        }

        if (this.lines) {
            this.group.remove(this.lines);
            this.lines.geometry.dispose();
            this.lines.material.dispose();
        }

        const lineVertices = [];
        this.edges.forEach(edge => {
            lineVertices.push(this.projectedPoints3D[edge[0]]);
            lineVertices.push(this.projectedPoints3D[edge[1]]);
        });

        const geometry = new THREE.BufferGeometry().setFromPoints(lineVertices);
        
        // Use a vibrant, somewhat emissive material for the lines
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ffff, // Cyan
            linewidth: 2
        }); 
        
        // Create a glowing effect for the lines
        const glowMaterial = new THREE.LineBasicMaterial({
            color: 0x99ffff, // Lighter cyan
            transparent: true,
            opacity: 0.6,
            linewidth: 5
        });
        
        this.lines = new THREE.LineSegments(geometry, material);
        this.group.add(this.lines);
    }
    
    update(deltaTime, time, uiParams = {}) {
        super.update(deltaTime, time, uiParams);
        
        // Update rotation angles based on UI parameters or use default speeds
        this.angleXW += (uiParams.rotationSpeeds?.xw ?? this.rotationSpeeds.xw);
        this.angleYZ += (uiParams.rotationSpeeds?.yz ?? this.rotationSpeeds.yz);
        this.angleXY += (uiParams.rotationSpeeds?.xy ?? this.rotationSpeeds.xy);
        this.angleZW += (uiParams.rotationSpeeds?.zw ?? this.rotationSpeeds.zw);
        
        // Update perspective distance if provided
        this.perspectiveDistance = uiParams.perspectiveDistance ?? this.perspectiveDistance;
        
        // Update the visualization
        this.projectAndDrawHypercube();
    }
    
    getUIControls() {
        return [
            {
                type: 'slider',
                id: 'rotationSpeeds.xw',
                label: 'XW Rotation Speed',
                min: -0.02,
                max: 0.02,
                step: 0.001,
                defaultValue: this.rotationSpeeds.xw
            },
            {
                type: 'slider',
                id: 'rotationSpeeds.yz',
                label: 'YZ Rotation Speed',
                min: -0.02,
                max: 0.02,
                step: 0.001,
                defaultValue: this.rotationSpeeds.yz
            },
            {
                type: 'slider',
                id: 'rotationSpeeds.xy',
                label: 'XY Rotation Speed',
                min: -0.02,
                max: 0.02,
                step: 0.001,
                defaultValue: this.rotationSpeeds.xy
            },
            {
                type: 'slider',
                id: 'rotationSpeeds.zw',
                label: 'ZW Rotation Speed',
                min: -0.02,
                max: 0.02,
                step: 0.001,
                defaultValue: this.rotationSpeeds.zw
            },
            {
                type: 'slider',
                id: 'perspectiveDistance',
                label: 'Perspective Distance',
                min: 1,
                max: 10,
                step: 0.1,
                defaultValue: this.perspectiveDistance
            }
        ];
    }
}

// For backward compatibility
export const info = {
    title: "Classic Tesseract",
    description: "The original tesseract visualization from the first implementation. A 4-dimensional hypercube (tesseract) projected into 3D space. It's rotating in multiple 4D planes. Observe how the 'inner' cube appears to turn 'inside out' without passing through the faces of the 'outer' cube."
};

export function initialize(scene, rendererSize) {
    const simulation = new ClassicTesseractSimulation(scene, rendererSize);
    simulation.initialize();
    
    return {
        update: (deltaTime, time, rendererSize) => simulation.update(deltaTime, time, { rendererSize }),
        cleanup: () => simulation.cleanup(),
        info: simulation.info
    };
}
