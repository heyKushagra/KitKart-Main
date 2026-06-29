/**
 * KitKart Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100; // Trigger threshold

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };

    // Initial check and on scroll
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger immediately for elements already in view

    // ==========================================================================
    // 3. Cart System Integration
    // ==========================================================================
    
    // Global Cart Badge Count Updater
    const updateCartBadge = () => {
        const cart = JSON.parse(localStorage.getItem('kitkart_cart')) || [];
        const totalCount = cart.reduce((total, item) => total + item.quantity, 0);
        const badges = document.querySelectorAll('#cart-count');
        badges.forEach(badge => {
            badge.textContent = totalCount;
        });
    };

    // Initialize Cart Badge
    updateCartBadge();

    // Listen for Add to Cart click on product pages
    const addToCartBtn = document.querySelector('.product-btn-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            // Get product info from DOM
            const titleEl = document.querySelector('.product-page-title');
            const priceEl = document.querySelector('.product-page-price');
            const imgEl = document.querySelector('.product-image-main img');
            const sizeEl = document.querySelector('input[name="size"]:checked');

            const name = titleEl ? titleEl.textContent.trim() : 'KitKart Premium Jersey';
            const priceText = priceEl ? priceEl.textContent.trim() : '₹1,499';
            // Convert price to number: strip currency symbol, spaces, commas
            const price = parseFloat(priceText.replace(/[^\d]/g, ''));
            const image = imgEl ? imgEl.getAttribute('src') : 'assets/jersey1.jpg';
            const size = sizeEl ? sizeEl.value.toUpperCase() : 'M';

            // Cart item structure
            const item = {
                id: `${name.toLowerCase().replace(/\s+/g, '-')}-${size}`,
                name: name,
                price: price,
                image: image,
                size: size,
                quantity: 1
            };

            // Fetch current cart
            let cart = JSON.parse(localStorage.getItem('kitkart_cart')) || [];

            // Check if item already exists
            const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push(item);
            }

            // Save cart
            localStorage.setItem('kitkart_cart', JSON.stringify(cart));

            // Update badge
            updateCartBadge();

            // Provide button feedback
            const originalContent = addToCartBtn.innerHTML;
            addToCartBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="margin-right:8px;">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Added!
            `;
            addToCartBtn.classList.add('added');
            addToCartBtn.disabled = true;

            setTimeout(() => {
                addToCartBtn.innerHTML = originalContent;
                addToCartBtn.classList.remove('added');
                addToCartBtn.disabled = false;
            }, 2000);
        });
    }
});
