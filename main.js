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

        container.innerHTML = ''; // Clear existing products
        productList.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <a href="product.html?id=${product.id}"><img src="${product.image}" alt="${product.name}"></a>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
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
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
            </div>
            <p class="cart-item-total">$${itemTotal.toFixed(2)}</p>
            <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart">×</button>
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
    if (document.querySelector('.featured-products .product-grid')) {
        renderProducts('.featured-products .product-grid', products.slice(0, 4));
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

});