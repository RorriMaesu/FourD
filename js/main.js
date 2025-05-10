// js/main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Simulation Modules ---
// Dynamically import them or list them here for build tools
// For simplicity in this example, we'll import them directly.
// In a larger app, you might use dynamic imports.
import * as tesseractSim from './simulations/tesseract.js';
import * as hyperSphereSim from './simulations/hyperSphere.js';
import * as slicerSim from './simulations/slicer4D.js';

const simulations = {
    'tesseract': tesseractSim,
    'hyperSphere': hyperSphereSim,
    'slicer4D': slicerSim
    // Add more simulations here
};

let scene, camera, renderer, controls, composer;
let clock = new THREE.Clock();
let currentSimulation = null;
let currentCleanupFunction = null;
let currentUpdateFunction = null;

const menuButtonsContainer = document.getElementById('menu-buttons');
const simTitleElement = document.getElementById('sim-title');
const simDescriptionElement = document.getElementById('sim-description');
const canvasContainer = document.getElementById('canvas-container');

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510); // Very dark blue

    // Camera
    camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    camera.position.set(0, 1, 4); // Adjusted initial camera position

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 20;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x606080, 1);
    scene.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x00aaff, 0.8);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);

    // Post-processing (for "stunning" visuals)
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(canvasContainer.clientWidth, canvasContainer.clientHeight),
        0.6, // strength
        0.3, // radius
        0.8  // threshold
    );
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // Create Menu
    createMenu();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

function createMenu() {
    Object.keys(simulations).forEach(simKey => {
        const simModule = simulations[simKey];
        const button = document.createElement('button');
        // Check if info exists before trying to access its properties
        button.textContent = (simModule.info && simModule.info.title) ? simModule.info.title : simKey;
        button.dataset.simKey = simKey;
        button.addEventListener('click', () => loadSimulation(simKey));
        menuButtonsContainer.appendChild(button);
    });
}

function loadSimulation(simKey) {
    if (currentCleanupFunction) {
        currentCleanupFunction(scene);
        currentCleanupFunction = null;
        currentUpdateFunction = null;
    }

    // Clear any previous specific objects not handled by cleanup (if any, though cleanup should handle all)
    // while(scene.children.length > 3){ // Keep camera and lights
    //     const obj = scene.children[scene.children.length -1];
    //     if (!(obj instanceof THREE.Light || obj instanceof THREE.Camera)){
    //         scene.remove(obj);
    //         if(obj.geometry) obj.geometry.dispose();
    //         if(obj.material) obj.material.dispose();
    //     } else {
    //         break; // Should not happen if lights are added first
    //     }
    // }


    const simModule = simulations[simKey];
    if (simModule && simModule.initialize) {
        const rendererSize = { width: canvasContainer.clientWidth, height: canvasContainer.clientHeight };
        const simInstance = simModule.initialize(scene, rendererSize); // Pass rendererSize if needed by sim
        currentUpdateFunction = simInstance.update;
        currentCleanupFunction = simInstance.cleanup;
        currentSimulation = simKey;

        simTitleElement.textContent = (simModule.info && simModule.info.title) ? simModule.info.title : "Simulation";
        simDescriptionElement.innerHTML = (simModule.info && simModule.info.description) ? simModule.info.description : "No description available.";

        // Update active button style
        document.querySelectorAll('#menu-buttons button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.simKey === simKey);
        });

        console.log(`Loaded simulation: ${simKey}`);
    } else {
        console.error(`Simulation ${simKey} not found or does not have an initialize function.`);
        simTitleElement.textContent = "Error";
        simDescriptionElement.textContent = `Could not load simulation: ${simKey}.`;
    }
}


function onWindowResize() {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    composer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight); // Important for post-processing

    // If current simulation needs to know about resize (e.g., for LineMaterial resolution)
    // This is a bit of a hack; a better way would be an event system or passing renderer ref.
    if (currentUpdateFunction && simulations[currentSimulation]?.onResize) {
         const rendererSize = { width: canvasContainer.clientWidth, height: canvasContainer.clientHeight };
        simulations[currentSimulation].onResize(rendererSize);
    } else if (currentUpdateFunction && currentSimulation === 'tesseract') {
        // Special handling for tesseract line material resolution
         const rendererSize = { width: canvasContainer.clientWidth, height: canvasContainer.clientHeight };
        if(scene.getObjectByProperty('type', 'Line2')) { // Find the Line2 mesh
            scene.getObjectByProperty('type', 'Line2').material.resolution.set(rendererSize.width, rendererSize.height);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    controls.update(); // Only if damping or auto-rotate is enabled

    if (currentUpdateFunction) {
        const rendererSize = { width: canvasContainer.clientWidth, height: canvasContainer.clientHeight };
        currentUpdateFunction(deltaTime, elapsedTime, rendererSize);
    }

    // renderer.render(scene, camera); // If not using composer
    composer.render();
}

// --- Start ---
init();
// Optionally load a default simulation
loadSimulation('tesseract');
