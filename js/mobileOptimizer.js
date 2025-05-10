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
        
        if (menuContainer && appHeader && menuButtons) {
            // Ensure the menu container is tall enough to show the header and buttons
            const minHeight = appHeader.offsetHeight + menuButtons.offsetHeight + 20;
            menuContainer.style.minHeight = `${minHeight}px`;
        }
        
        // Add touch event listeners for better mobile scrolling
        addTouchScrolling();
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
    setTimeout(optimizeForMobile, 100);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    optimizeForMobile();
    
    // Handle orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
});
