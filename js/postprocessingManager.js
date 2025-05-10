// js/postprocessingManager.js
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
// import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

export class PostprocessingManager {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = new EffectComposer(renderer);
        this.setupPasses();
    }

    setupPasses() {
        // Render Pass - renders the scene
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Bloom Pass - adds glow effect to bright objects
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.7,  // strength
            0.3,  // radius (spread)
            0.85  // threshold (pixels brighter than this will bloom)
        );
        this.composer.addPass(bloomPass);

        // SSAO Pass - adds ambient occlusion (commented out for performance)
        /*
        const ssaoPass = new SSAOPass(this.scene, this.camera, window.innerWidth, window.innerHeight);
        ssaoPass.kernelRadius = 8;
        ssaoPass.minDistance = 0.001;
        ssaoPass.maxDistance = 0.1;
        this.composer.addPass(ssaoPass);
        */

        // FXAA Pass - anti-aliasing (commented out for now)
        /*
        const fxaaPass = new ShaderPass(FXAAShader);
        const pixelRatio = this.renderer.getPixelRatio();
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
        this.composer.addPass(fxaaPass);
        */

        // Output Pass - handles tone mapping and encoding
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }

    render(deltaTime) {
        this.composer.render(deltaTime);
    }

    onResize(width, height) {
        this.composer.setSize(width, height);
        
        // Update resolution for passes that need it
        /*
        const pixelRatio = this.renderer.getPixelRatio();
        this.composer.passes.forEach(pass => {
            if (pass.material && pass.material.uniforms && pass.material.uniforms['resolution']) {
                pass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
                pass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
            }
            if (pass.setSize) pass.setSize(width, height);
        });
        */
    }

    cleanup() {
        // Dispose of resources
        this.composer.passes.forEach(pass => {
            if (pass.dispose) pass.dispose();
        });
        this.composer = null;
    }
}
