// js/sceneManager.js
import * as THREE from 'three';
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export class SceneManager {
    constructor(scene) {
        this.scene = scene;
        this.defaultCameraPos = new THREE.Vector3(0, 2, 7);
    }

    setupEnvironment() {
        // Set up a dark background
        this.scene.background = new THREE.Color(0x050510);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x606080, 1);
        this.scene.add(ambientLight);

        // Add directional lights
        const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight1.position.set(1, 1, 1);
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x00aaff, 0.8);
        dirLight2.position.set(-1, -1, -1);
        this.scene.add(dirLight2);

        // Create a subtle starfield background
        this.createStarfield();

        // HDRI Environment (commented out for now, can be enabled later)
        /*
        new RGBELoader()
            .setPath('assets/textures/')
            .load('env_map.hdr', (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.environment = texture; // For PBR material reflections
                console.log("HDRI Environment loaded.");
            });
        */
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        
        // Create 10000 random stars
        for (let i = 0; i < 10000; i++) {
            const x = THREE.MathUtils.randFloatSpread(1000);
            const y = THREE.MathUtils.randFloatSpread(1000);
            const z = THREE.MathUtils.randFloatSpread(1000);
            starVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        
        // Create a point material with a small size
        const starsMaterial = new THREE.PointsMaterial({
            color: 0x8888ff,
            size: 0.5,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.7
        });
        
        const starMesh = new THREE.Points(starsGeometry, starsMaterial);
        starMesh.name = "starfield";
        starMesh.renderOrder = -1; // Render behind everything
        this.scene.add(starMesh);
    }
    
    updateStarfield(deltaTime) {
        const starMesh = this.scene.getObjectByName("starfield");
        if (starMesh) {
            starMesh.rotation.y += 0.005 * deltaTime;
            starMesh.rotation.x += 0.002 * deltaTime;
        }
    }

    resetCamera(camera, controls) {
        camera.position.copy(this.defaultCameraPos);
        camera.lookAt(0, 0, 0);
        if (controls) controls.target.set(0, 0, 0);
    }

    update(deltaTime) {
        this.updateStarfield(deltaTime);
    }

    cleanup() {
        // Remove all objects from the scene
        while(this.scene.children.length > 0) {
            const obj = this.scene.children[0];
            this.scene.remove(obj);
            
            // Dispose of geometries and materials
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        }
    }
}
