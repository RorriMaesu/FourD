// js/scrollIndicator.js

// Function to check if the menu container is scrollable
function checkScrollable() {
    const menuContainer = document.getElementById('menu-container');
    const scrollIndicator = document.getElementById('scroll-indicator');

    if (!menuContainer || !scrollIndicator) return;

    // Check if the content is taller than the container
    const isScrollable = menuContainer.scrollHeight > menuContainer.clientHeight + 20; // Add some buffer

    // Show/hide the scroll indicator based on scrollability
    scrollIndicator.style.visibility = isScrollable ? 'visible' : 'hidden';

    // Add a class to the menu container to indicate it's scrollable
    if (isScrollable) {
        menuContainer.classList.add('scrollable');
    } else {
        menuContainer.classList.remove('scrollable');
    }
}

// Function to check if user has scrolled to the bottom
function checkScrollPosition() {
    const menuContainer = document.getElementById('menu-container');
    const scrollIndicator = document.getElementById('scroll-indicator');

    if (!menuContainer || !scrollIndicator) return;

    // Calculate how far the user has scrolled
    const scrollPosition = menuContainer.scrollTop + menuContainer.clientHeight;
    const scrollHeight = menuContainer.scrollHeight;

    // If user is near the bottom (within 20px), fade out the indicator
    if (scrollHeight - scrollPosition < 20) {
        scrollIndicator.style.opacity = '0';
    } else {
        scrollIndicator.style.opacity = '1';
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const menuContainer = document.getElementById('menu-container');

    if (menuContainer) {
        // Initial check after a short delay to ensure all content is loaded
        setTimeout(checkScrollable, 100);

        // Check on scroll
        menuContainer.addEventListener('scroll', checkScrollPosition);

        // Check when window is resized
        window.addEventListener('resize', checkScrollable);

        // Check when controls are added/removed (which might change content height)
        const observer = new MutationObserver(() => {
            setTimeout(checkScrollable, 100); // Delay to ensure DOM updates are complete
        });
        observer.observe(menuContainer, { childList: true, subtree: true });
    }
});
