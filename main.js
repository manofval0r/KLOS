document.addEventListener('DOMContentLoaded', () => {
    
    // --- MOCK PRODUCT DATA ---
    // In a real application, this would come from a server API
    const products = [
        { id: 1, name: 'The Classic Hoody', price: 60, image: 'images/hoody-1.jpg', category: 'coats' },
        { id: 2, name: 'Silk Blend Blouse', price: 80, image: 'images/noimage.jpg', category: 'tops' },
        { id: 3, name: 'High-Waist Trousers', price: 150, image: 'images/trousers-2.jpg', category: 'bottoms' },
        { id: 4, name: 'The Evening Gown', price: 200, image: 'images/noimage.jpg', category: 'dresses' },
        { id: 5, name: 'The Not So Classic Hoody', price: 120, image: 'images/hoody-2.jpg'},
        { id: 6, name: 'Comfy Cargo Pants', price: 80, image: 'images/cargo-pants.jpg' },
        { id: 7, name: 'The Occasion Setter', price: 150, image: 'images/dress-1.jpg' },
        { id: 8, name: 'Gravy On Top', price: 40, image: 'images/noimage.jpg'}
    ];

    // --- CART LOGIC ---
    // Initialize cart from localStorage or as an empty array
    let cart = JSON.parse(localStorage.getItem('kloCart')) || [];

    function updateCart() {
        renderCartItems();
        updateCartIcon();
        // Save cart to localStorage whenever it's updated
        localStorage.setItem('kloCart', JSON.stringify(cart));
    }
    
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            // Check if product is already in cart
            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            updateCart();
            showToast(`${product.name} added to cart!`);
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }

    function updateQuantity(productId, newQuantity) {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            if (newQuantity > 0) {
                cartItem.quantity = newQuantity;
            } else {
                removeFromCart(productId);
            }
            updateCart();
        }
    }
    
    function updateCartIcon() {
        const cartIcon = document.querySelector('.cart-item-count');
        if (cartIcon) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartIcon.textContent = totalItems;
            cartIcon.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // --- DYNAMIC RENDERING ---
    function renderProducts(containerSelector, productList) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = '';
    if (productList.length === 0) {
        container.innerHTML = '<p class="no-products-message">No products match your criteria.</p>';
        return;
    }
    
    productList.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        // The link now wraps the entire image for a larger click area
        productCard.innerHTML = `
            <div class="product-image-container">
                <a href="product.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </a>
                <!-- NEW: Quick-view overlay -->
                <div class="product-overlay">
                    <a href="product.html?id=${product.id}" class="btn btn-secondary">View Details</a>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name"><a href="product.html?id=${product.id}">${product.name}</a></h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
            </div>
        `;
        container.appendChild(productCard);
    });
}

    function renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');

    // Exit if we're not on the cart page
    if (!cartItemsContainer || !cartSummary) return;

    // Load the most current cart from localStorage inside the function
    const cart = JSON.parse(localStorage.getItem('kloCart')) || [];

    // --- Part 1: Handle Empty Cart ---
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is currently empty.</p>';
        cartSummary.style.display = 'none'; // Hide summary box
        
        // Explicitly set totals to zero for empty cart
        document.getElementById('cart-subtotal').textContent = '$0.00';
        document.getElementById('cart-shipping').textContent = '$0.00';
        document.getElementById('cart-total').textContent = '$0.00';
        return; // Stop the function here if cart is empty
    }

    // --- Part 2: Handle Cart with Items ---
    cartSummary.style.display = 'block'; // Ensure summary is visible
    cartItemsContainer.innerHTML = '';   // Clear any existing items
    
    let subtotal = 0;

    // Loop through each item, create its HTML, and add to the subtotal
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal; // Accumulate the subtotal

        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
    <div class="cart-item-image-container">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
    </div>
    <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
        <div class="cart-item-controls">
            <label for="quantity-${item.id}" class="sr-only">Quantity</label>
            <input type="number" id="quantity-${item.id}" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
            <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart">Remove</button>
        </div>
    </div>
    <div class="cart-item-total-container">
        <p class="cart-item-total">$${itemTotal.toFixed(2)}</p>
    </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    // --- Part 3: Calculate Final Totals and Update the DOM ---
    const shippingCost = 10
    +.00; // Your fixed shipping cost
    const total = subtotal + shippingCost;

    // Use the calculated values to update the text content of your summary spans
    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = `$${shippingCost.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

     // ---: FILTER & SORT LOGIC ---
    function applyFiltersAndRender() {
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        // Make sure we are on the shop page before running
        if (!categoryFilter || !sortFilter) return;

        const selectedCategory = categoryFilter.value;
        const selectedSort = sortFilter.value;

        // 1. Start with all products
        let filteredProducts = [...products];

        // 2. Apply category filter
        if (selectedCategory !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        }

        // 3. Apply sorting
        if (selectedSort === 'price-asc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (selectedSort === 'price-desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        // 4. Render the result
        renderProducts('.shop-page .product-grid', filteredProducts);
    }
    
    function renderProductDetail() {
    const productDetailContainer = document.getElementById('product-detail-content');
    if (!productDetailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (product) {
        document.title = `${product.name} - Klo's House of Fashion`;
        
        // Let's assume each product has multiple images
        // In a real scenario, this would come from your product data.
        const imageGallery = [product.image, 'images/detail-2.jpg', 'images/detail-3.jpg'];

        productDetailContainer.innerHTML = `
            <div class="breadcrumb">
                <a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <span>${product.name}</span>
            </div>
            <div class="product-detail-layout">
                <div class="product-gallery">
                    <div class="main-image-container">
                        <img src="${imageGallery[0]}" alt="${product.name}" id="main-product-image">
                    </div>
                    <div class="thumbnail-gallery">
                        ${imageGallery.map((imgSrc, index) => `
                            <img src="${imgSrc}" alt="Thumbnail ${index + 1}" class="thumbnail-image ${index === 0 ? 'active' : ''}">
                        `).join('')}
                    </div>
                </div>

                <div class="product-detail-info">
                    <h1 class="product-name">${product.name}</h1>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <p class="product-description">
                        Discover the perfect blend of modern elegance and timeless design. This piece is crafted from premium materials for a comfortable fit and a stunning look.
                    </p>
                    
                    <div class="product-actions">
                        <div class="quantity-selector">
                            <label for="quantity">Quantity:</label>
                            <input type="number" id="quantity" value="1" min="1">
                        </div>
                        <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                    </div>

                    <div class="product-accordion">
                        <div class="accordion-item">
                            <button class="accordion-header">Sizing & Fit</button>
                            <div class="accordion-panel">
                                <p>Fits true to size. Model is 5'9" and is wearing a size Small. We recommend taking your normal size.</p>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <button class="accordion-header">Materials & Care</button>
                            <div class="accordion-panel">
                                <p>Made from 95% organic cotton and 5% spandex for a slight stretch. Machine wash cold, hang to dry. Do not bleach.</p>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <button class="accordion-header">Shipping & Returns</button>
                            <div class="accordion-panel">
                                <p>Free standard shipping on orders over $150. We accept returns within 30 days of delivery. See our <a href="shipping-returns.html" class="inline-link">full policy</a>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section class="related-products">
                <h2 class="section-title">You Might Also Like</h2>
                <div class="product-grid-like">
                    <!-- Related products will be rendered here by JS -->
                </div>
            </section>
        `;

        // Render related products (excluding the current one)
        const related = products.filter(p => p.id !== product.id).slice(0, 3);
        renderProducts('.related-products .product-grid-like', related);

    } else {
        productDetailContainer.innerHTML = '<h2>Product not found.</h2>';
    }
}
    
    // --- EVENT LISTENERS ---
    document.body.addEventListener('click', (e) => {
        // Add to Cart Button
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
        // Remove from Cart Button
        if (e.target.classList.contains('cart-item-remove')) {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        }
    });
    
    // NEW: Listen for changes on filter controls
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (categoryFilter && sortFilter) {
        categoryFilter.addEventListener('change', applyFiltersAndRender);
        sortFilter.addEventListener('change', applyFiltersAndRender);
    }

    document.body.addEventListener('change', (e) => {
        // Update quantity input
        if (e.target.classList.contains('quantity-input')) {
            const productId = parseInt(e.target.dataset.id);
            const newQuantity = parseInt(e.target.value);
            updateQuantity(productId, newQuantity);
        }
    });

    // --- PAGE INITIALIZATION ---
    // Homepage: Render featured products
    // Homepage: Render the new Curated Collection
if (document.querySelector('.curated-collection')) {
    const heroContainer = document.querySelector('.collection-hero');
    const gridContainer = document.querySelector('.collection-grid');
    
    // Select the first product for the main hero display
    const heroProduct = products[0];
    if (heroContainer && heroProduct) {
        heroContainer.innerHTML = `
            <a href="product.html?id=${heroProduct.id}">
                <img src="${heroProduct.image}" alt="${heroProduct.name}">
                <div class="collection-hero-content">
                    <h3>${heroProduct.name}</h3>
                    <p>Discover the Look of the Season</p>
                    <span class="btn btn-secondary">View Product</span>
                </div>
            </a>
        `;
    }
    
    // Use the existing renderProducts function for the smaller grid
    // Select the 2nd and 3rd products for this grid
    if (gridContainer) {
        renderProducts('.collection-grid', products.slice(1, 3));
    }
}
    // Shop Page: Initial render with filters
    if (document.querySelector('.shop-page')) {
        applyFiltersAndRender(); // <<<<<<< IMPORTANT CHANGE HERE
    }
    // Product Detail Page
    if (document.querySelector('.product-detail-page')) {
        renderProductDetail();
    }
    // Cart Page
    if (document.querySelector('.cart-items')) {
        renderCartItems();
    }
    
    updateCartIcon();

    // Responsive Navbar
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // --- Mobile Grid View Toggle Logic ---
if (document.querySelector('.shop-page')) {
    const grid = document.querySelector('.product-grid');
    const toggleBtn1 = document.getElementById('toggle-grid-1');
    const toggleBtn2 = document.getElementById('toggle-grid-2');

    // Ensure all elements exist before adding listeners
    if (grid && toggleBtn1 && toggleBtn2) {
        toggleBtn1.addEventListener('click', () => {
            grid.classList.remove('two-column-view');
            toggleBtn1.classList.add('active');
            toggleBtn2.classList.remove('active');
        });

        toggleBtn2.addEventListener('click', () => {
            grid.classList.add('two-column-view');
            toggleBtn2.classList.add('active');
            toggleBtn1.classList.remove('active');
        });
    }
}

// --- Interactive Logic for Product Detail Page ---
if (document.querySelector('.product-detail-page')) {
    const productDetailContent = document.getElementById('product-detail-content');

    // Use event delegation for performance
    productDetailContent.addEventListener('click', (e) => {
        
        // Image Gallery Logic
        if (e.target.classList.contains('thumbnail-image')) {
            const mainImage = document.getElementById('main-product-image');
            mainImage.src = e.target.src; // Update main image source

            // Update active state on thumbnails
            document.querySelectorAll('.thumbnail-image').forEach(thumb => thumb.classList.remove('active'));
            e.target.classList.add('active');
        }

        // Accordion Logic
        if (e.target.classList.contains('accordion-header')) {
            const button = e.target;
            const panel = button.nextElementSibling;

            button.classList.toggle('active');

            if (panel.style.maxHeight) {
                panel.style.maxHeight = null; // Collapse the panel
                panel.style.padding = '0 1rem';
            } else {
                // Set max-height to its scroll height to animate open
                panel.style.maxHeight = panel.scrollHeight + 'px';
                panel.style.padding = '0 1rem 1.5rem';
            }
        }
    });
}

});