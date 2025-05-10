// js/mobileOptimizer.js

// Function to detect if the device is mobile
function isMobileDevice() {
    return (
        window.innerWidth <= 768 ||
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
    );
}

// Function to optimize the layout for mobile
function optimizeForMobile() {
    const isMobile = isMobileDevice();
    const body = document.body;

    if (isMobile) {
        body.classList.add('mobile-device');

        // Adjust menu container height based on content
        const menuContainer = document.getElementById('menu-container');
        const appHeader = document.querySelector('.app-header');
        const menuButtons = document.getElementById('menu-buttons');
        const coffeeButton = document.querySelector('.coffee-button');

        if (menuContainer && appHeader && menuButtons) {
            // Ensure the menu container is tall enough to show the header and buttons
            let minHeight = appHeader.offsetHeight + menuButtons.offsetHeight + 20;

            // Add coffee button height if it exists
            if (coffeeButton) {
                minHeight += coffeeButton.offsetHeight + 20;
            }

            menuContainer.style.minHeight = `${minHeight}px`;

            // Center the Buy Me a Coffee button
            if (coffeeButton) {
                coffeeButton.style.margin = '10px auto';
            }

            // Make buttons more tappable
            const buttons = menuButtons.querySelectorAll('button');
            buttons.forEach(button => {
                button.style.minHeight = '44px'; // Minimum recommended touch target size
            });
        }

        // Add touch event listeners for better mobile scrolling
        addTouchScrolling();

        // Optimize for orientation
        optimizeForOrientation();
    }
}

// Function to optimize layout based on device orientation
function optimizeForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const menuContainer = document.getElementById('menu-container');
    const canvasContainer = document.getElementById('canvas-container');

    if (!menuContainer || !canvasContainer) return;

    if (isLandscape) {
        // In landscape mode on mobile, adjust the layout
        menuContainer.style.maxHeight = '40%';
        canvasContainer.style.height = '60%';
    } else {
        // In portrait mode, give more space to the menu
        menuContainer.style.maxHeight = '45%';
        canvasContainer.style.height = '55%';
    }
}

// Function to add touch-specific scrolling behavior
function addTouchScrolling() {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) return;

    let startY = 0;
    let startScrollTop = 0;
    let touchInProgress = false;

    menuContainer.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
        startScrollTop = menuContainer.scrollTop;
        touchInProgress = true;
    }, { passive: true });

    menuContainer.addEventListener('touchmove', function(e) {
        if (!touchInProgress) return;

        const touchY = e.touches[0].pageY;
        const diff = startY - touchY;

        menuContainer.scrollTop = startScrollTop + diff;

        // If we're at the top or bottom of the scroll area, allow the page to scroll
        if ((menuContainer.scrollTop <= 0 && diff < 0) ||
            (menuContainer.scrollTop + menuContainer.clientHeight >= menuContainer.scrollHeight && diff > 0)) {
            touchInProgress = false;
        } else {
            // Prevent default only if we're scrolling within the container
            e.preventDefault();
        }
    }, { passive: false });

    menuContainer.addEventListener('touchend', function() {
        touchInProgress = false;
    }, { passive: true });
}

// Function to handle orientation changes
function handleOrientationChange() {
    // Re-optimize for the new orientation
    setTimeout(() => {
        optimizeForMobile();
        optimizeForOrientation();

        // Force redraw of the canvas to prevent rendering issues
        const canvas = document.querySelector('canvas');
        if (canvas) {
            // Trigger a resize event to update the canvas
            window.dispatchEvent(new Event('resize'));
        }
    }, 300); // Longer timeout to ensure the orientation change is complete
}

// Function to ensure the Buy Me a Coffee button is visible
function ensureCoffeeButtonVisibility() {
    const coffeeButton = document.querySelector('.coffee-button');
    if (!coffeeButton) return;

    // Move the coffee button to the top of the menu if on mobile
    if (isMobileDevice()) {
        const menuContainer = document.getElementById('menu-container');
        const appHeader = document.querySelector('.app-header');

        if (menuContainer && appHeader) {
            // Clone the button
            const buttonClone = coffeeButton.cloneNode(true);

            // Add mobile-specific class
            buttonClone.classList.add('mobile-coffee-button');

            // Insert after the header
            appHeader.after(buttonClone);

            // Hide the original button
            coffeeButton.style.display = 'none';

            // Add event listener to the clone
            buttonClone.addEventListener('click', function(e) {
                window.open('https://buymeacoffee.com/rorrimaesu', '_blank');
            });
        }
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    optimizeForMobile();
    ensureCoffeeButtonVisibility();

    // Handle orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Recheck visibility after a short delay to ensure DOM is fully rendered
    setTimeout(ensureCoffeeButtonVisibility, 500);
});
