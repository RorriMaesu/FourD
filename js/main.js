// js/main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Import managers
import { SceneManager } from './sceneManager.js';
import { PostprocessingManager } from './postprocessingManager.js';
import { UIManager } from './uiManager.js';

// Import simulation modules
import * as tesseractSim from './simulations/tesseract.js';
import * as hyperSphereSim from './simulations/hyperSphere.js';
import * as slicerSim from './simulations/slicer4D.js';
import * as classicTesseractSim from './simulations/classicTesseract.js';

// Import simulation classes
import { TesseractSimulation } from './simulations/tesseract.js';
import { HyperSphereSimulation } from './simulations/hyperSphere.js';
import { Slicer4DSimulation } from './simulations/slicer4D.js';
import { ClassicTesseractSimulation } from './simulations/classicTesseract.js';

// Application class
class App4D {
    constructor() {
        // DOM elements
        this.canvasContainer = document.getElementById('canvas-container');

        // Three.js core components
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Managers
        this.sceneManager = null;
        this.postprocessingManager = null;
        this.uiManager = new UIManager();

        // Simulation handling
        this.simulations = {
            'tesseract': tesseractSim,
            'hyperSphere': hyperSphereSim,
            'slicer4D': slicerSim,
            'classicTesseract': classicTesseractSim
        };

        this.simulationClasses = {
            'tesseract': TesseractSimulation,
            'hyperSphere': HyperSphereSimulation,
            'slicer4D': Slicer4DSimulation,
            'classicTesseract': ClassicTesseractSimulation
        };

        this.activeSimulation = null;
        this.clock = new THREE.Clock();

        // Initialize the application
        this.init();
    }

    init() {
        // Initialize Three.js components
        this.initThreeJS();

        // Initialize managers
        this.sceneManager = new SceneManager(this.scene);
        this.sceneManager.setupEnvironment();

        this.postprocessingManager = new PostprocessingManager(
            this.renderer,
            this.scene,
            this.camera
        );

        // Initialize UI
        this.uiManager.onSimulationChange = (simKey) => this.loadSimulation(simKey);
        this.uiManager.onParamChange = (params) => this.updateSimulationParams(params);
        this.uiManager.initialize(this.simulations, 'tesseract');

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Start animation loop
        this.animate();
    }

    initThreeJS() {
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvasContainer.clientWidth / this.canvasContainer.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 7);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(
            this.canvasContainer.clientWidth,
            this.canvasContainer.clientHeight
        );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.canvasContainer.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 20;
    }

    loadSimulation(simKey) {
        // Clean up previous simulation if exists
        if (this.activeSimulation) {
            this.activeSimulation.cleanup();
            this.activeSimulation = null;
        }

        // Get renderer size
        const rendererSize = {
            width: this.canvasContainer.clientWidth,
            height: this.canvasContainer.clientHeight
        };

        // Create and initialize new simulation
        const SimClass = this.simulationClasses[simKey];
        if (SimClass) {
            this.activeSimulation = new SimClass(this.scene, rendererSize);
            this.activeSimulation.initialize();

            // Update UI with simulation info
            this.uiManager.updateSimulationInfo(this.activeSimulation.info);

            // Create UI controls for this simulation
            this.uiManager.createControls(this.activeSimulation.getUIControls());

            console.log(`Loaded simulation: ${simKey}`);
        } else {
            console.error(`Simulation class not found for: ${simKey}`);
        }
    }

    updateSimulationParams(params) {
        // Store parameters for use in animation loop
        this.simulationParams = params;
    }

    onWindowResize() {
        // Update camera
        this.camera.aspect = this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer
        this.renderer.setSize(
            this.canvasContainer.clientWidth,
            this.canvasContainer.clientHeight
        );

        // Update post-processing
        this.postprocessingManager.onResize(
            this.canvasContainer.clientWidth,
            this.canvasContainer.clientHeight
        );

        // Update active simulation
        if (this.activeSimulation) {
            this.activeSimulation.onResize({
                width: this.canvasContainer.clientWidth,
                height: this.canvasContainer.clientHeight
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Update controls
        this.controls.update();

        // Update scene manager (e.g., starfield rotation)
        this.sceneManager.update(deltaTime);

        // Update active simulation
        if (this.activeSimulation) {
            this.activeSimulation.update(
                deltaTime,
                elapsedTime,
                this.uiManager.getUIParams()
            );
        }

        // Render with post-processing
        this.postprocessingManager.render(deltaTime);
    }
}

// Create and start the application
const app = new App4D();
