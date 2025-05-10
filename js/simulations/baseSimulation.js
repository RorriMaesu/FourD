// js/simulations/baseSimulation.js
import * as THREE from 'three';

/**
 * Base class for all 4D simulations
 * Provides common functionality and interface
 */
export class BaseSimulation {
    constructor(scene, rendererSize) {
        this.scene = scene;
        this.rendererSize = rendererSize;
        this.group = new THREE.Group(); // Container for all objects in this simulation
        this.scene.add(this.group);
        
        // Default info
        this.info = {
            title: "Base Simulation",
            description: "This is a base simulation class. Override this in derived classes."
        };
        
        // Default UI parameters
        this.uiParams = {};
    }
    
    /**
     * Initialize the simulation
     * Override this in derived classes
     */
    initialize() {
        console.log("Base simulation initialized");
        return this;
    }
    
    /**
     * Update the simulation
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {number} time - Total elapsed time in seconds
     * @param {Object} uiParams - Parameters from UI controls
     */
    update(deltaTime, time, uiParams = {}) {
        // Override this in derived classes
        this.uiParams = { ...this.uiParams, ...uiParams };
    }
    
    /**
     * Handle window resize
     * @param {Object} newRendererSize - New renderer size {width, height}
     */
    onResize(newRendererSize) {
        this.rendererSize = newRendererSize;
    }
    
    /**
     * Clean up resources when simulation is no longer needed
     */
    cleanup() {
        this.scene.remove(this.group);
        this.group.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
    
    /**
     * Get UI parameters for this simulation
     * Override this in derived classes to provide simulation-specific UI controls
     * @returns {Array} Array of UI control definitions
     */
    getUIControls() {
        return [
            {
                type: 'slider',
                id: 'example',
                label: 'Example Control',
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: 0.5
            }
        ];
    }
}
