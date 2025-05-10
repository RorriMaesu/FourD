// js/uiManager.js
export class UIManager {
    constructor() {
        this.menuButtonsContainer = document.getElementById('menu-buttons');
        this.simTitleElement = document.getElementById('sim-title');
        this.simDescriptionElement = document.getElementById('sim-description');
        this.controlsContainer = document.getElementById('controls-container');
        
        this.activeSimulation = null;
        this.uiParams = {};
        this.controlElements = {};
        this.onSimulationChange = null;
        this.onParamChange = null;
    }
    
    initialize(simulations, defaultSimulation) {
        this.createMenu(simulations);
        
        if (defaultSimulation && simulations[defaultSimulation]) {
            this.loadSimulation(defaultSimulation);
        }
    }
    
    createMenu(simulations) {
        // Clear existing buttons
        this.menuButtonsContainer.innerHTML = '';
        
        // Create buttons for each simulation
        Object.keys(simulations).forEach(simKey => {
            const simModule = simulations[simKey];
            const button = document.createElement('button');
            
            // Get the title from the info object or use the key as fallback
            button.textContent = simModule.info?.title || simKey;
            button.dataset.simKey = simKey;
            button.addEventListener('click', () => this.loadSimulation(simKey));
            this.menuButtonsContainer.appendChild(button);
        });
    }
    
    loadSimulation(simKey) {
        // Update active button
        document.querySelectorAll('#menu-buttons button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.simKey === simKey);
        });
        
        // Set active simulation
        this.activeSimulation = simKey;
        
        // Reset UI parameters
        this.uiParams = {};
        
        // Notify callback if set
        if (this.onSimulationChange) {
            this.onSimulationChange(simKey);
        }
    }
    
    updateSimulationInfo(info) {
        if (!info) return;
        
        this.simTitleElement.textContent = info.title || "Simulation";
        this.simDescriptionElement.innerHTML = info.description || "No description available.";
    }
    
    createControls(controls) {
        // Clear existing controls
        this.controlsContainer.innerHTML = '';
        this.controlElements = {};
        
        // If no controls, hide the container
        if (!controls || controls.length === 0) {
            this.controlsContainer.style.display = 'none';
            return;
        }
        
        // Show the container and add title
        this.controlsContainer.style.display = 'block';
        const title = document.createElement('h3');
        title.textContent = 'Controls';
        this.controlsContainer.appendChild(title);
        
        // Create controls
        controls.forEach(control => {
            const controlGroup = document.createElement('div');
            controlGroup.className = 'control-group';
            
            const label = document.createElement('label');
            label.className = 'control-label';
            label.textContent = control.label;
            controlGroup.appendChild(label);
            
            let inputElement;
            
            switch (control.type) {
                case 'slider':
                    const sliderContainer = document.createElement('div');
                    sliderContainer.className = 'slider-container';
                    
                    inputElement = document.createElement('input');
                    inputElement.type = 'range';
                    inputElement.min = control.min;
                    inputElement.max = control.max;
                    inputElement.step = control.step;
                    inputElement.value = control.defaultValue;
                    
                    const valueDisplay = document.createElement('span');
                    valueDisplay.className = 'slider-value';
                    valueDisplay.textContent = control.defaultValue;
                    
                    inputElement.addEventListener('input', () => {
                        valueDisplay.textContent = inputElement.value;
                        this.updateParam(control.id, parseFloat(inputElement.value));
                    });
                    
                    sliderContainer.appendChild(inputElement);
                    sliderContainer.appendChild(valueDisplay);
                    controlGroup.appendChild(sliderContainer);
                    break;
                    
                case 'checkbox':
                    const checkboxContainer = document.createElement('div');
                    checkboxContainer.className = 'checkbox-container';
                    
                    inputElement = document.createElement('input');
                    inputElement.type = 'checkbox';
                    inputElement.checked = control.defaultValue;
                    
                    inputElement.addEventListener('change', () => {
                        this.updateParam(control.id, inputElement.checked);
                    });
                    
                    checkboxContainer.appendChild(inputElement);
                    controlGroup.appendChild(checkboxContainer);
                    break;
                    
                // Add more control types as needed
            }
            
            this.controlElements[control.id] = inputElement;
            this.controlsContainer.appendChild(controlGroup);
            
            // Initialize parameter value
            this.updateParam(control.id, control.defaultValue);
        });
    }
    
    updateParam(id, value) {
        // Handle nested parameters (e.g., 'rotationSpeeds.xw')
        if (id.includes('.')) {
            const [parent, child] = id.split('.');
            if (!this.uiParams[parent]) {
                this.uiParams[parent] = {};
            }
            this.uiParams[parent][child] = value;
        } else {
            this.uiParams[id] = value;
        }
        
        // Notify callback if set
        if (this.onParamChange) {
            this.onParamChange(this.uiParams);
        }
    }
    
    getUIParams() {
        return this.uiParams;
    }
    
    showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
}
