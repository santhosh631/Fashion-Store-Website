// API Base URL (Relative to make it work seamlessly on any host/port)
const API_BASE = "";

// State Management
let currentUser = null;
let cartItemsCount = 0;

// Toast Helper
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✨';
    if (type === 'error') icon = '⚠️';
    
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('active'), 10);
    
    // Remove after 3.5s
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// Check Authentication
function checkAuth() {
    const userStr = localStorage.getItem('fashion_user');
    if (userStr) {
        try {
            currentUser = JSON.parse(userStr);
        } catch (e) {
            localStorage.removeItem('fashion_user');
        }
    }
    updateNavbar();
}

// Update Navbar UI
function updateNavbar() {
    const authContainer = document.getElementById('navbar-auth');
    if (!authContainer) return;
    
    if (currentUser) {
        authContainer.innerHTML = `
            <a href="orders.html" class="nav-link-item">My Orders</a>
            <span style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 500;">Hello, ${currentUser.full_name}</span>
            <a href="#" id="logout-link" class="btn btn-secondary" style="padding: 0.4rem 1rem; font-size: 0.7rem;">Logout</a>
        `;
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    } else {
        authContainer.innerHTML = `
            <a href="login.html" class="nav-link-item">Login</a>
            <a href="register.html" class="btn btn-outline" style="padding: 0.4rem 1rem; font-size: 0.7rem;">Register</a>
        `;
    }
    
    // Sync cart count badge
    updateCartBadge();
}

// Update Cart Badge Count
async function updateCartBadge() {
    const badge = document.getElementById('cart-badge-count');
    if (!badge) return;
    
    if (!currentUser) {
        badge.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/cart/?customer_name=${encodeURIComponent(currentUser.full_name)}`);
        if (response.ok) {
            const items = await response.json();
            // Count total quantities in cart
            const totalQty = items.reduce((acc, item) => acc + item.quantity, 0);
            cartItemsCount = totalQty;
            if (totalQty > 0) {
                badge.textContent = totalQty;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (e) {
        console.error("Failed to fetch cart count:", e);
    }
}

// Logout
function logout() {
    localStorage.removeItem('fashion_user');
    currentUser = null;
    showToast("Logged out successfully.", "success");
    updateNavbar();
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
}

// Active Nav Link Highlight
function highlightActiveNav() {
    const path = window.location.pathname;
    const page = path.split("/").pop() || "index.html";
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Page Specific Initializations
document.addEventListener('DOMContentLoaded', () => {
    // Scroll event for navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    checkAuth();
    highlightActiveNav();
    
    // Page routers
    const pageId = document.body.id;
    if (pageId === 'home-page') {
        initHomePage();
    } else if (pageId === 'products-page') {
        initProductsPage();
    } else if (pageId === 'cart-page') {
        initCartPage();
    } else if (pageId === 'checkout-page') {
        initCheckoutPage();
    } else if (pageId === 'orders-page') {
        initOrdersPage();
    } else if (pageId === 'login-page') {
        initLoginPage();
    } else if (pageId === 'register-page') {
        initRegisterPage();
    } else if (pageId === 'dashboard-page') {
        initDashboardPage();
    }
});


// ==========================================
// HOME PAGE MODULE
// ==========================================
function initHomePage() {
    // Banner Slider
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }
    
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => showSlide(idx));
    });
    
    // Auto slide change
    setInterval(() => {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }, 5000);
    
    // Fetch and display featured products (trending limits to 4 items)
    fetchFeaturedProducts();
}

async function fetchFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;
    
    try {
        const res = await fetch(`${API_BASE}/products/`);
        if (res.ok) {
            const products = await res.json();
            grid.innerHTML = "";
            
            // Limit to first 4 products for showcase
            products.slice(0, 4).forEach(prod => {
                const card = createProductCard(prod);
                grid.appendChild(card);
            });
        }
    } catch (e) {
        console.error("Error loading featured products", e);
        grid.innerHTML = `<p class="text-center w-100" style="color: var(--danger)">Failed to load products. Please check server connection.</p>`;
    }
}

function createProductCard(prod) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const isLowStock = prod.stock > 0 && prod.stock <= 5;
    const isOutOfStock = prod.stock <= 0;
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${prod.image_url}" alt="${prod.product_name}" onerror="this.src='https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60'">
            ${isOutOfStock ? `<div class="product-tag" style="background-color: var(--danger);">SOLD OUT</div>` : (isLowStock ? `<div class="product-tag">LOW STOCK</div>` : '')}
        </div>
        <div class="product-info">
            <div class="product-brand">${prod.brand}</div>
            <h3 class="product-title">${prod.product_name}</h3>
            <div class="product-metadata">
                <span class="product-category">${prod.category}</span>
                <span>Size: ${prod.size}</span>
            </div>
            <div class="product-metadata">
                <span class="product-price">₹${prod.price}</span>
                <span class="product-stock ${isOutOfStock ? 'low-stock' : ''}">${isOutOfStock ? 'No Stock' : `Stock: ${prod.stock}`}</span>
            </div>
            <button class="btn btn-primary product-card-btn" ${isOutOfStock ? 'disabled' : ''}>
                ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `;
    
    const btn = card.querySelector('.product-card-btn');
    btn.addEventListener('click', () => {
        addToCart(prod);
    });
    
    return card;
}

// Add to Cart helper
async function addToCart(prod) {
    if (!currentUser) {
        showToast("Please log in to add items to your cart.", "info");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
        return;
    }
    
    try {
        const payload = {
            customer_name: currentUser.full_name,
            product_name: prod.product_name,
            quantity: 1,
            price: prod.price
        };
        
        const res = await fetch(`${API_BASE}/cart/add/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            const data = await res.json();
            showToast(`Added "${prod.product_name}" to your cart!`, "success");
            updateCartBadge();
        } else {
            const data = await res.json();
            showToast(data.error || "Failed to add to cart.", "error");
        }
    } catch (e) {
        showToast("Server error. Could not connect.", "error");
    }
}


// ==========================================
// PRODUCTS LISTINGS / CATALOG PAGE
// ==========================================
let allProductsList = [];
function initProductsPage() {
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const priceVal = document.getElementById('price-val');
    
    // Load categories for filter dropdown
    loadCategoriesDropdown();
    
    // Load all products
    loadProductsCatalog();
    
    // Hook up event listeners
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (priceFilter) {
        priceFilter.addEventListener('input', (e) => {
            priceVal.textContent = `₹${e.target.value}`;
            applyFilters();
        });
    }
}

async function loadCategoriesDropdown() {
    const dropdown = document.getElementById('category-filter');
    if (!dropdown) return;
    
    try {
        const res = await fetch(`${API_BASE}/categories/`);
        if (res.ok) {
            const categories = await res.json();
            // Preserve the 'All Categories' option
            dropdown.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(cat => {
                dropdown.innerHTML += `<option value="${cat.category_name}">${cat.category_name}</option>`;
            });
        }
    } catch (e) {
        console.error("Error loading categories dropdown", e);
    }
}

async function loadProductsCatalog() {
    const grid = document.getElementById('products-catalog-grid');
    if (!grid) return;
    
    try {
        const res = await fetch(`${API_BASE}/products/`);
        if (res.ok) {
            allProductsList = await res.json();
            
            // Set max price on filter slider dynamically
            const prices = allProductsList.map(p => p.price);
            if (prices.length > 0) {
                const maxPrice = Math.max(...prices);
                const slider = document.getElementById('price-filter');
                const priceVal = document.getElementById('price-val');
                if (slider) {
                    slider.max = maxPrice;
                    slider.value = maxPrice;
                    priceVal.textContent = `₹${maxPrice}`;
                }
            }
            
            renderProducts(allProductsList);
        }
    } catch (e) {
        console.error("Error loading products", e);
        grid.innerHTML = `<p class="text-center w-100" style="color: var(--danger)">Failed to load product catalog.</p>`;
    }
}

function renderProducts(products) {
    const grid = document.getElementById('products-catalog-grid');
    if (!grid) return;
    
    grid.innerHTML = "";
    if (products.length === 0) {
        grid.innerHTML = `<div class="empty-state w-100">
            <div class="empty-state-icon">🔍</div>
            <h3>No Products Found</h3>
            <p>Try modifying your search or filter settings.</p>
        </div>`;
        return;
    }
    
    products.forEach(p => {
        grid.appendChild(createProductCard(p));
    });
}

function applyFilters() {
    const searchVal = document.getElementById('search-input')?.value.toLowerCase() || "";
    const categoryVal = document.getElementById('category-filter')?.value || "";
    const priceVal = parseFloat(document.getElementById('price-filter')?.value) || Infinity;
    
    const filtered = allProductsList.filter(p => {
        const matchesSearch = p.product_name.toLowerCase().includes(searchVal) || p.brand.toLowerCase().includes(searchVal);
        const matchesCategory = categoryVal === "" || p.category === categoryVal;
        const matchesPrice = p.price <= priceVal;
        return matchesSearch && matchesCategory && matchesPrice;
    });
    
    renderProducts(filtered);
}


// ==========================================
// CART PAGE MODULE
// ==========================================
async function initCartPage() {
    if (!currentUser) {
        showToast("Please log in to view your cart.", "info");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
        return;
    }
    
    loadCartList();
}

async function loadCartList() {
    const tableBody = document.getElementById('cart-items-body');
    const layout = document.getElementById('cart-layout-container');
    const emptyState = document.getElementById('cart-empty-state');
    
    if (!tableBody) return;
    
    try {
        const res = await fetch(`${API_BASE}/cart/?customer_name=${encodeURIComponent(currentUser.full_name)}`);
        if (res.ok) {
            const items = await res.json();
            if (items.length === 0) {
                if (layout) layout.style.display = 'none';
                if (emptyState) emptyState.style.display = 'block';
                return;
            }
            
            if (layout) layout.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';
            
            tableBody.innerHTML = "";
            let subtotal = 0;
            
            // For images, we can fetch product metadata mapping product_name to image_url or use fallback
            // To make it efficient, we can load all products once to resolve images
            const prodRes = await fetch(`${API_BASE}/products/`);
            let productImages = {};
            if (prodRes.ok) {
                const products = await prodRes.json();
                products.forEach(p => {
                    productImages[p.product_name] = p.image_url;
                });
            }
            
            items.forEach(item => {
                const tr = document.createElement('tr');
                const img = productImages[item.product_name] || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60';
                subtotal += item.total_price;
                
                tr.innerHTML = `
                    <td>
                        <div class="cart-item-detail">
                            <img class="cart-item-img" src="${img}" alt="${item.product_name}">
                            <div>
                                <div class="cart-item-name">${item.product_name}</div>
                                <div class="cart-item-meta">Price: ₹${item.price}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="quantity-control">
                            <button class="qty-btn dec-btn" data-id="${item.cart_id}" data-qty="${item.quantity}" data-price="${item.price}">-</button>
                            <span class="qty-val">${item.quantity}</span>
                            <button class="qty-btn inc-btn" data-id="${item.cart_id}" data-qty="${item.quantity}" data-price="${item.price}">+</button>
                        </div>
                    </td>
                    <td class="cart-item-price">₹${item.total_price}</td>
                    <td>
                        <button class="admin-action-btn delete remove-cart-btn" data-id="${item.cart_id}" style="font-size: 1.1rem; border: none; background: none; cursor: pointer;">✕</button>
                    </td>
                `;
                
                tableBody.appendChild(tr);
            });
            
            // Update Summary
            const subtotalEl = document.getElementById('cart-subtotal');
            const totalEl = document.getElementById('cart-total');
            if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
            if (totalEl) totalEl.textContent = `₹${subtotal}`;
            
            // Attach Event Listeners
            tableBody.querySelectorAll('.dec-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const qty = parseInt(e.target.getAttribute('data-qty'));
                    const price = parseFloat(e.target.getAttribute('data-price'));
                    if (qty > 1) {
                        await updateCartQuantity(id, qty - 1, price);
                    } else {
                        await removeCartItem(id);
                    }
                });
            });
            
            tableBody.querySelectorAll('.inc-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const qty = parseInt(e.target.getAttribute('data-qty'));
                    const price = parseFloat(e.target.getAttribute('data-price'));
                    await updateCartQuantity(id, qty + 1, price);
                });
            });
            
            tableBody.querySelectorAll('.remove-cart-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    await removeCartItem(id);
                });
            });
            
        }
    } catch (e) {
        console.error("Error fetching cart items", e);
    }
}

async function updateCartQuantity(id, qty, price) {
    try {
        const res = await fetch(`${API_BASE}/cart/update/${id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: qty, price: price })
        });
        if (res.ok) {
            loadCartList();
            updateCartBadge();
        } else {
            showToast("Failed to update cart.", "error");
        }
    } catch (e) {
        showToast("Error updating cart quantity", "error");
    }
}

async function removeCartItem(id) {
    try {
        const res = await fetch(`${API_BASE}/cart/delete/${id}/`, {
            method: 'DELETE'
        });
        if (res.ok) {
            showToast("Item removed from cart.", "success");
            loadCartList();
            updateCartBadge();
        } else {
            showToast("Failed to remove item.", "error");
        }
    } catch (e) {
        showToast("Error deleting cart item", "error");
    }
}


// ==========================================
// CHECKOUT PAGE MODULE
// ==========================================
async function initCheckoutPage() {
    if (!currentUser) {
        showToast("Please log in to checkout.", "info");
        window.location.href = "login.html";
        return;
    }
    
    // Auto fill address details if available
    const fullNameEl = document.getElementById('checkout-fullname');
    const addressEl = document.getElementById('checkout-address');
    const cityEl = document.getElementById('checkout-city');
    const phoneEl = document.getElementById('checkout-phone');
    
    if (fullNameEl) fullNameEl.value = currentUser.full_name;
    if (addressEl) addressEl.value = currentUser.address;
    if (cityEl) cityEl.value = currentUser.city;
    if (phoneEl) phoneEl.value = currentUser.phone;
    
    // Calculate total order amount
    let total = 0;
    try {
        const res = await fetch(`${API_BASE}/cart/?customer_name=${encodeURIComponent(currentUser.full_name)}`);
        if (res.ok) {
            const items = await res.json();
            if (items.length === 0) {
                showToast("Your cart is empty. Redirecting to Shop.", "info");
                setTimeout(() => { window.location.href = "products.html"; }, 1500);
                return;
            }
            
            const summaryBody = document.getElementById('checkout-summary-body');
            if (summaryBody) {
                summaryBody.innerHTML = "";
                items.forEach(item => {
                    total += item.total_price;
                    summaryBody.innerHTML += `
                        <div class="summary-row" style="margin-bottom: 0.5rem; font-size: 0.85rem;">
                            <span>${item.product_name} x ${item.quantity}</span>
                            <span>₹${item.total_price}</span>
                        </div>
                    `;
                });
                
                const totalEl = document.getElementById('checkout-total-price');
                if (totalEl) totalEl.textContent = `₹${total}`;
            }
        }
    } catch (e) {
        console.error("Error compiling checkout total", e);
    }
    
    // Set up Payment Method Toggles
    let selectedPaymentMethod = "UPI";
    const cards = document.querySelectorAll('.payment-method-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            cards.forEach(c => c.classList.remove('active'));
            const activeCard = e.target.closest('.payment-method-card');
            activeCard.classList.add('active');
            selectedPaymentMethod = activeCard.getAttribute('data-method');
        });
    });
    
    // Handle Place Order
    const placeOrderForm = document.getElementById('checkout-form');
    if (placeOrderForm) {
        placeOrderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check form details
            const name = fullNameEl.value.trim();
            const address = addressEl.value.trim();
            const city = cityEl.value.trim();
            const phone = phoneEl.value.trim();
            
            if (!name || !address || !city || !phone) {
                showToast("Please fill in all delivery details.", "error");
                return;
            }
            
            try {
                // If payment method is Card or UPI, mark Paid, else COD marks Pending
                const paymentStatus = (selectedPaymentMethod === "Cash on Delivery") ? "Pending" : "Paid";
                const today = new Date().toISOString().split('T')[0];
                
                const payload = {
                    customer_name: currentUser.full_name,
                    order_date: today,
                    total_amount: total,
                    payment_method: selectedPaymentMethod,
                    payment_status: paymentStatus,
                    delivery_status: "Processing"
                };
                
                const res = await fetch(`${API_BASE}/orders/add/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    const data = await res.json();
                    showToast("Order placed successfully! Thank you for shopping.", "success");
                    updateCartBadge();
                    setTimeout(() => {
                        window.location.href = "orders.html";
                    }, 2000);
                } else {
                    const err = await res.json();
                    showToast(err.error || "Order placement failed.", "error");
                }
            } catch (e) {
                showToast("Could not place order. Server error.", "error");
            }
        });
    }
}


// ==========================================
// ORDERS PAGE MODULE
// ==========================================
async function initOrdersPage() {
    if (!currentUser) {
        showToast("Please log in to view orders.", "info");
        window.location.href = "login.html";
        return;
    }
    
    loadOrdersHistory();
}

async function loadOrdersHistory() {
    const listEl = document.getElementById('orders-history-list');
    const emptyEl = document.getElementById('orders-empty-state');
    
    if (!listEl) return;
    
    try {
        const res = await fetch(`${API_BASE}/orders/?customer_name=${encodeURIComponent(currentUser.full_name)}`);
        if (res.ok) {
            const orders = await res.json();
            if (orders.length === 0) {
                listEl.style.display = 'none';
                if (emptyEl) emptyEl.style.display = 'block';
                return;
            }
            
            listEl.style.display = 'flex';
            if (emptyEl) emptyEl.style.display = 'none';
            
            listEl.innerHTML = "";
            orders.forEach(order => {
                const card = document.createElement('div');
                card.className = 'order-card';
                
                const dStatus = order.delivery_status.toLowerCase();
                const pStatus = order.payment_status.toLowerCase();
                
                card.innerHTML = `
                    <div class="order-header">
                        <div class="order-id">ORDER ID: <span>#${order.order_id}</span></div>
                        <div class="order-date">Date: ${order.order_date}</div>
                    </div>
                    <div class="order-details-grid">
                        <div class="order-detail-item">
                            <div class="order-detail-label">Total Amount</div>
                            <div class="order-detail-val" style="color: var(--accent-gold); font-weight: 600;">₹${order.total_amount}</div>
                        </div>
                        <div class="order-detail-item">
                            <div class="order-detail-label">Payment Method</div>
                            <div class="order-detail-val">${order.payment_method}</div>
                        </div>
                        <div class="order-detail-item">
                            <div class="order-detail-label">Payment Status</div>
                            <div class="order-detail-val">
                                <span class="status-badge status-${pStatus}">${order.payment_status}</span>
                            </div>
                        </div>
                        <div class="order-detail-item">
                            <div class="order-detail-label">Delivery Status</div>
                            <div class="order-detail-val">
                                <span class="status-badge status-${dStatus}">${order.delivery_status}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                listEl.appendChild(card);
            });
        }
    } catch (e) {
        console.error("Error fetching order history", e);
    }
}


// ==========================================
// LOGIN & REGISTRATION MODULE
// ==========================================
function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            showToast("Please enter email and password.", "error");
            return;
        }
        
        try {
            // Check for mock testing Admin credentials directly
            if (email === "admin@fashion.com" && password === "admin123") {
                const adminUser = {
                    customer_id: 999,
                    full_name: "Admin",
                    email: "admin@fashion.com",
                    phone: "0000000000",
                    address: "Admin Headquarters",
                    city: "System"
                };
                localStorage.setItem('fashion_user', JSON.stringify(adminUser));
                showToast("Welcome Admin! Entering Dashboard...", "success");
                setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
                return;
            }
            
            const res = await fetch(`${API_BASE}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('fashion_user', JSON.stringify(data.customer));
                showToast("Logged in successfully! Redirecting...", "success");
                setTimeout(() => {
                    // Check if they are admin or customer
                    window.location.href = "index.html";
                }, 1500);
            } else {
                const data = await res.json();
                showToast(data.error || "Invalid credentials.", "error");
            }
        } catch (err) {
            showToast("Login request failed. Server offline.", "error");
        }
    });
}

function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('reg-fullname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const address = document.getElementById('reg-address').value.trim();
        const city = document.getElementById('reg-city').value.trim();
        const password = document.getElementById('reg-password').value;
        
        if (!fullName || !email || !phone || !address || !city || !password) {
            showToast("Please fill in all registration fields.", "error");
            return;
        }
        
        try {
            const payload = {
                full_name: fullName,
                email: email,
                phone: phone,
                address: address,
                city: city,
                password: password
            };
            
            const res = await fetch(`${API_BASE}/customers/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                const data = await res.json();
                showToast("Account created successfully! Please login.", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                const data = await res.json();
                showToast(data.error || "Registration failed.", "error");
            }
        } catch (err) {
            showToast("Network error. Registration failed.", "error");
        }
    });
}


// ==========================================
// ADMIN DASHBOARD MODULE
// ==========================================
let activeTab = "products";
let activeEditId = null;

function initDashboardPage() {
    // Check if logged in user is admin, if not show warning or allow for testing
    const userStr = localStorage.getItem('fashion_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || user.email !== "admin@fashion.com") {
        // Render a friendly testing prompt
        const body = document.body;
        const banner = document.createElement('div');
        banner.style.cssText = "background-color: var(--accent-gold); color: var(--bg-primary); padding: 0.5rem; text-align: center; font-size: 0.8rem; font-weight: bold; position: fixed; top: 75px; left:0; right:0; z-index: 999;";
        banner.innerHTML = "📢 Evaluation Mode: Admin Dashboard is accessible. To login officially as administrator, use <strong>admin@fashion.com</strong> / <strong>admin123</strong>.";
        body.insertBefore(banner, body.firstChild);
    }
    
    // Wire up sidebar tabs
    const tabs = document.querySelectorAll('.dashboard-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            activeTab = e.target.getAttribute('data-tab');
            loadPanelContent();
        });
    });
    
    // Wire up Add New Button
    const addBtn = document.getElementById('dashboard-add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openAddModal();
        });
    }
    
    // Modal controls
    const modal = document.getElementById('dashboard-modal');
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    const form = document.getElementById('dashboard-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Initial Load
    loadPanelContent();
}

function loadPanelContent() {
    const tableHead = document.getElementById('admin-table-head');
    const tableBody = document.getElementById('admin-table-body');
    const panelTitle = document.getElementById('dashboard-panel-title');
    const addBtn = document.getElementById('dashboard-add-btn');
    
    if (!tableHead || !tableBody) return;
    
    tableBody.innerHTML = `<tr><td colspan="10" class="text-center">Loading panel content...</td></tr>`;
    
    if (activeTab === "products") {
        panelTitle.textContent = "Manage Products";
        if (addBtn) addBtn.style.display = "inline-flex";
        
        tableHead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Size</th>
                <th>Color</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
            </tr>
        `;
        fetchProductsAdmin();
    } 
    else if (activeTab === "categories") {
        panelTitle.textContent = "Manage Categories";
        if (addBtn) addBtn.style.display = "inline-flex";
        
        tableHead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        `;
        fetchCategoriesAdmin();
    } 
    else if (activeTab === "customers") {
        panelTitle.textContent = "Manage Customers";
        if (addBtn) addBtn.style.display = "inline-flex"; // Enable adding customer from admin
        
        tableHead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>City</th>
                <th>Actions</th>
            </tr>
        `;
        fetchCustomersAdmin();
    } 
    else if (activeTab === "orders") {
        panelTitle.textContent = "Manage Orders";
        if (addBtn) addBtn.style.display = "none"; // Disallow placing manual orders here
        
        tableHead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Customer Name</th>
                <th>Order Date</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Delivery Status</th>
                <th>Actions</th>
            </tr>
        `;
        fetchOrdersAdmin();
    }
}

// --- Fetch Admin Helpers ---
async function fetchProductsAdmin() {
    const tbody = document.getElementById('admin-table-body');
    try {
        const res = await fetch(`${API_BASE}/products/`);
        if (res.ok) {
            const list = await res.json();
            tbody.innerHTML = "";
            list.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.product_id}</td>
                    <td style="font-weight: 500;">${p.product_name}</td>
                    <td>${p.category}</td>
                    <td>${p.brand}</td>
                    <td>${p.size}</td>
                    <td>${p.color}</td>
                    <td>₹${p.price}</td>
                    <td>${p.stock}</td>
                    <td>
                        <div class="admin-actions">
                            <button class="admin-action-btn edit" onclick="editProduct(${p.product_id})">✏️</button>
                            <button class="admin-action-btn delete" onclick="deleteProduct(${p.product_id})">🗑️</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="color: var(--danger);">Error loading products.</td></tr>`;
    }
}

async function fetchCategoriesAdmin() {
    const tbody = document.getElementById('admin-table-body');
    try {
        const res = await fetch(`${API_BASE}/categories/`);
        if (res.ok) {
            const list = await res.json();
            tbody.innerHTML = "";
            list.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${c.category_id}</td>
                    <td style="font-weight: 500;">${c.category_name}</td>
                    <td>${c.description}</td>
                    <td>
                        <div class="admin-actions">
                            <button class="admin-action-btn edit" onclick="editCategory(${c.category_id})">✏️</button>
                            <button class="admin-action-btn delete" onclick="deleteCategory(${c.category_id})">🗑️</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--danger);">Error loading categories.</td></tr>`;
    }
}

async function fetchCustomersAdmin() {
    const tbody = document.getElementById('admin-table-body');
    try {
        const res = await fetch(`${API_BASE}/customers/`);
        if (res.ok) {
            const list = await res.json();
            tbody.innerHTML = "";
            list.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${c.customer_id}</td>
                    <td style="font-weight: 500;">${c.full_name}</td>
                    <td>${c.email}</td>
                    <td>${c.phone}</td>
                    <td>${c.address}</td>
                    <td>${c.city}</td>
                    <td>
                        <div class="admin-actions">
                            <button class="admin-action-btn edit" onclick="editCustomer(${c.customer_id})">✏️</button>
                            <button class="admin-action-btn delete" onclick="deleteCustomer(${c.customer_id})">🗑️</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: var(--danger);">Error loading customers.</td></tr>`;
    }
}

async function fetchOrdersAdmin() {
    const tbody = document.getElementById('admin-table-body');
    try {
        const res = await fetch(`${API_BASE}/orders/`);
        if (res.ok) {
            const list = await res.json();
            tbody.innerHTML = "";
            list.forEach(o => {
                const tr = document.createElement('tr');
                const dStatus = o.delivery_status.toLowerCase();
                const pStatus = o.payment_status.toLowerCase();
                
                tr.innerHTML = `
                    <td>${o.order_id}</td>
                    <td style="font-weight: 500;">${o.customer_name}</td>
                    <td>${o.order_date}</td>
                    <td>₹${o.total_amount}</td>
                    <td>${o.payment_method}</td>
                    <td><span class="status-badge status-${pStatus}">${o.payment_status}</span></td>
                    <td><span class="status-badge status-${dStatus}">${o.delivery_status}</span></td>
                    <td>
                        <div class="admin-actions">
                            <button class="admin-action-btn edit" onclick="editOrder(${o.order_id})">✏️</button>
                            <button class="admin-action-btn delete" onclick="deleteOrder(${o.order_id})">🗑️</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: var(--danger);">Error loading orders.</td></tr>`;
    }
}


// --- Modal & Form Add/Edit Configurations ---
function openAddModal() {
    activeEditId = null;
    const modalTitle = document.getElementById('modal-title-text');
    const fieldsContainer = document.getElementById('modal-fields-container');
    const modal = document.getElementById('dashboard-modal');
    
    modalTitle.textContent = `Add New ${activeTab.slice(0, -1)}`;
    fieldsContainer.innerHTML = "";
    
    if (activeTab === "products") {
        fieldsContainer.innerHTML = `
            <div class="form-group mb-2">
                <label>Product Name</label>
                <input type="text" class="form-control" id="form-product-name" required>
            </div>
            <div class="form-group mb-2">
                <label>Category</label>
                <select class="form-control" id="form-product-category" required></select>
            </div>
            <div class="form-group mb-2">
                <label>Brand</label>
                <input type="text" class="form-control" id="form-product-brand" required>
            </div>
            <div class="form-group mb-2">
                <label>Size</label>
                <input type="text" class="form-control" id="form-product-size" placeholder="L, M, S, 10, One Size" required>
            </div>
            <div class="form-group mb-2">
                <label>Color</label>
                <input type="text" class="form-control" id="form-product-color" required>
            </div>
            <div class="form-group mb-2">
                <label>Price</label>
                <input type="number" step="0.01" class="form-control" id="form-product-price" required>
            </div>
            <div class="form-group mb-2">
                <label>Stock</label>
                <input type="number" class="form-control" id="form-product-stock" required>
            </div>
            <div class="form-group mb-2">
                <label>Image URL</label>
                <input type="text" class="form-control" id="form-product-image" value="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60" required>
            </div>
        `;
        populateCategoryOptions('form-product-category');
    } 
    else if (activeTab === "categories") {
        fieldsContainer.innerHTML = `
            <div class="form-group mb-2">
                <label>Category Name</label>
                <input type="text" class="form-control" id="form-category-name" required>
            </div>
            <div class="form-group mb-2">
                <label>Description</label>
                <textarea class="form-control" id="form-category-desc" rows="3" required></textarea>
            </div>
        `;
    }
    else if (activeTab === "customers") {
        fieldsContainer.innerHTML = `
            <div class="form-group mb-2">
                <label>Full Name</label>
                <input type="text" class="form-control" id="form-customer-name" required>
            </div>
            <div class="form-group mb-2">
                <label>Email</label>
                <input type="email" class="form-control" id="form-customer-email" required>
            </div>
            <div class="form-group mb-2">
                <label>Phone</label>
                <input type="text" class="form-control" id="form-customer-phone" required>
            </div>
            <div class="form-group mb-2">
                <label>Address</label>
                <input type="text" class="form-control" id="form-customer-address" required>
            </div>
            <div class="form-group mb-2">
                <label>City</label>
                <input type="text" class="form-control" id="form-customer-city" required>
            </div>
            <div class="form-group mb-2">
                <label>Password</label>
                <input type="password" class="form-control" id="form-customer-password" required>
            </div>
        `;
    }
    
    modal.classList.add('active');
}

async function populateCategoryOptions(selectId, selectedVal = "") {
    const select = document.getElementById(selectId);
    if (!select) return;
    try {
        const res = await fetch(`${API_BASE}/categories/`);
        if (res.ok) {
            const list = await res.json();
            select.innerHTML = "";
            list.forEach(c => {
                select.innerHTML += `<option value="${c.category_name}" ${c.category_name === selectedVal ? 'selected' : ''}>${c.category_name}</option>`;
            });
        }
    } catch (e) {
        console.error("Error loading categories option", e);
    }
}

// Global scope hooks for onclick buttons in admin table
window.editProduct = async function(id) {
    activeEditId = id;
    const modalTitle = document.getElementById('modal-title-text');
    const fieldsContainer = document.getElementById('modal-fields-container');
    const modal = document.getElementById('dashboard-modal');
    
    try {
        // Find product info from database
        const res = await fetch(`${API_BASE}/products/`);
        if (res.ok) {
            const list = await res.json();
            const p = list.find(item => item.product_id === id);
            if (!p) return;
            
            modalTitle.textContent = "Edit Product";
            fieldsContainer.innerHTML = `
                <div class="form-group mb-2">
                    <label>Product Name</label>
                    <input type="text" class="form-control" id="form-product-name" value="${p.product_name}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Category</label>
                    <select class="form-control" id="form-product-category" required></select>
                </div>
                <div class="form-group mb-2">
                    <label>Brand</label>
                    <input type="text" class="form-control" id="form-product-brand" value="${p.brand}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Size</label>
                    <input type="text" class="form-control" id="form-product-size" value="${p.size}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Color</label>
                    <input type="text" class="form-control" id="form-product-color" value="${p.color}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Price</label>
                    <input type="number" step="0.01" class="form-control" id="form-product-price" value="${p.price}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Stock</label>
                    <input type="number" class="form-control" id="form-product-stock" value="${p.stock}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Image URL</label>
                    <input type="text" class="form-control" id="form-product-image" value="${p.image_url}" required>
                </div>
            `;
            await populateCategoryOptions('form-product-category', p.category);
            modal.classList.add('active');
        }
    } catch (e) {
        showToast("Error retrieving product details.", "error");
    }
};

window.deleteProduct = async function(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
        const res = await fetch(`${API_BASE}/products/delete/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast("Product deleted successfully.", "success");
            fetchProductsAdmin();
        } else {
            showToast("Failed to delete product.", "error");
        }
    } catch (e) {
        showToast("Server error deleting product.", "error");
    }
};

window.editCategory = async function(id) {
    activeEditId = id;
    const modalTitle = document.getElementById('modal-title-text');
    const fieldsContainer = document.getElementById('modal-fields-container');
    const modal = document.getElementById('dashboard-modal');
    
    try {
        const res = await fetch(`${API_BASE}/categories/`);
        if (res.ok) {
            const list = await res.json();
            const c = list.find(item => item.category_id === id);
            if (!c) return;
            
            modalTitle.textContent = "Edit Category";
            fieldsContainer.innerHTML = `
                <div class="form-group mb-2">
                    <label>Category Name</label>
                    <input type="text" class="form-control" id="form-category-name" value="${c.category_name}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Description</label>
                    <textarea class="form-control" id="form-category-desc" rows="3" required>${c.description}</textarea>
                </div>
            `;
            modal.classList.add('active');
        }
    } catch (e) {
        showToast("Error retrieving category details.", "error");
    }
};

window.deleteCategory = async function(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
        const res = await fetch(`${API_BASE}/categories/delete/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast("Category deleted successfully.", "success");
            fetchCategoriesAdmin();
        } else {
            showToast("Failed to delete category.", "error");
        }
    } catch (e) {
        showToast("Server error deleting category.", "error");
    }
};

window.editCustomer = async function(id) {
    activeEditId = id;
    const modalTitle = document.getElementById('modal-title-text');
    const fieldsContainer = document.getElementById('modal-fields-container');
    const modal = document.getElementById('dashboard-modal');
    
    try {
        const res = await fetch(`${API_BASE}/customers/`);
        if (res.ok) {
            const list = await res.json();
            const c = list.find(item => item.customer_id === id);
            if (!c) return;
            
            modalTitle.textContent = "Edit Customer Profile";
            fieldsContainer.innerHTML = `
                <div class="form-group mb-2">
                    <label>Full Name</label>
                    <input type="text" class="form-control" id="form-customer-name" value="${c.full_name}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Email</label>
                    <input type="email" class="form-control" id="form-customer-email" value="${c.email}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Phone</label>
                    <input type="text" class="form-control" id="form-customer-phone" value="${c.phone}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Address</label>
                    <input type="text" class="form-control" id="form-customer-address" value="${c.address}" required>
                </div>
                <div class="form-group mb-2">
                    <label>City</label>
                    <input type="text" class="form-control" id="form-customer-city" value="${c.city}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Password (Leave blank to keep current)</label>
                    <input type="password" class="form-control" id="form-customer-password" placeholder="••••••••">
                </div>
            `;
            modal.classList.add('active');
        }
    } catch (e) {
        showToast("Error retrieving customer details.", "error");
    }
};

window.deleteCustomer = async function(id) {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
        const res = await fetch(`${API_BASE}/customers/delete/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast("Customer deleted successfully.", "success");
            fetchCustomersAdmin();
        } else {
            showToast("Failed to delete customer.", "error");
        }
    } catch (e) {
        showToast("Server error deleting customer.", "error");
    }
};

window.editOrder = async function(id) {
    activeEditId = id;
    const modalTitle = document.getElementById('modal-title-text');
    const fieldsContainer = document.getElementById('modal-fields-container');
    const modal = document.getElementById('dashboard-modal');
    
    try {
        const res = await fetch(`${API_BASE}/orders/`);
        if (res.ok) {
            const list = await res.json();
            const o = list.find(item => item.order_id === id);
            if (!o) return;
            
            modalTitle.textContent = "Edit Order Details";
            fieldsContainer.innerHTML = `
                <div class="form-group mb-2">
                    <label>Customer Name</label>
                    <input type="text" class="form-control" id="form-order-custname" value="${o.customer_name}" readonly>
                </div>
                <div class="form-group mb-2">
                    <label>Order Date</label>
                    <input type="date" class="form-control" id="form-order-date" value="${o.order_date}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Total Amount (₹)</label>
                    <input type="number" step="0.01" class="form-control" id="form-order-total" value="${o.total_amount}" required>
                </div>
                <div class="form-group mb-2">
                    <label>Payment Method</label>
                    <input type="text" class="form-control" id="form-order-paymethod" value="${o.payment_method}" readonly>
                </div>
                <div class="form-group mb-2">
                    <label>Payment Status</label>
                    <select class="form-control" id="form-order-paystatus" required>
                        <option value="Pending" ${o.payment_status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Paid" ${o.payment_status === 'Paid' ? 'selected' : ''}>Paid</option>
                        <option value="Failed" ${o.payment_status === 'Failed' ? 'selected' : ''}>Failed</option>
                    </select>
                </div>
                <div class="form-group mb-2">
                    <label>Delivery Status</label>
                    <select class="form-control" id="form-order-delivstatus" required>
                        <option value="Processing" ${o.delivery_status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${o.delivery_status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Out for Delivery" ${o.delivery_status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="Delivered" ${o.delivery_status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${o.delivery_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            `;
            modal.classList.add('active');
        }
    } catch (e) {
        showToast("Error retrieving order details.", "error");
    }
};

window.deleteOrder = async function(id) {
    if (!confirm("Are you sure you want to delete this order record?")) return;
    try {
        const res = await fetch(`${API_BASE}/orders/delete/${id}/`, { method: 'DELETE' });
        if (res.ok) {
            showToast("Order deleted successfully.", "success");
            fetchOrdersAdmin();
        } else {
            showToast("Failed to delete order.", "error");
        }
    } catch (e) {
        showToast("Server error deleting order.", "error");
    }
};

// Handle Submit (Create or Update)
async function handleFormSubmit(e) {
    e.preventDefault();
    const modal = document.getElementById('dashboard-modal');
    
    let url = "";
    let method = "";
    let payload = {};
    
    if (activeTab === "products") {
        const pName = document.getElementById('form-product-name').value.trim();
        const pCat = document.getElementById('form-product-category').value;
        const pBrand = document.getElementById('form-product-brand').value.trim();
        const pSize = document.getElementById('form-product-size').value.trim();
        const pColor = document.getElementById('form-product-color').value.trim();
        const pPrice = parseFloat(document.getElementById('form-product-price').value);
        const pStock = parseInt(document.getElementById('form-product-stock').value);
        const pImg = document.getElementById('form-product-image').value.trim();
        
        payload = {
            product_name: pName,
            category: pCat,
            brand: pBrand,
            size: pSize,
            color: pColor,
            price: pPrice,
            stock: pStock,
            image_url: pImg
        };
        
        if (activeEditId) {
            url = `${API_BASE}/products/update/${activeEditId}/`;
            method = "PUT";
        } else {
            url = `${API_BASE}/products/add/`;
            method = "POST";
        }
    } 
    else if (activeTab === "categories") {
        const cName = document.getElementById('form-category-name').value.trim();
        const cDesc = document.getElementById('form-category-desc').value.trim();
        
        payload = {
            category_name: cName,
            description: cDesc
        };
        
        if (activeEditId) {
            url = `${API_BASE}/categories/update/${activeEditId}/`;
            method = "PUT";
        } else {
            url = `${API_BASE}/categories/add/`;
            method = "POST";
        }
    } 
    else if (activeTab === "customers") {
        const cName = document.getElementById('form-customer-name').value.trim();
        const cEmail = document.getElementById('form-customer-email').value.trim();
        const cPhone = document.getElementById('form-customer-phone').value.trim();
        const cAddress = document.getElementById('form-customer-address').value.trim();
        const cCity = document.getElementById('form-customer-city').value.trim();
        const cPassword = document.getElementById('form-customer-password').value;
        
        payload = {
            full_name: cName,
            email: cEmail,
            phone: cPhone,
            address: cAddress,
            city: cCity
        };
        if (cPassword) payload.password = cPassword;
        
        if (activeEditId) {
            url = `${API_BASE}/customers/update/${activeEditId}/`;
            method = "PUT";
        } else {
            url = `${API_BASE}/customers/add/`;
            method = "POST";
            if (!cPassword) {
                showToast("Password is required for new registration.", "error");
                return;
            }
        }
    } 
    else if (activeTab === "orders") {
        // Orders are update-only via admin dashboard
        const oCustName = document.getElementById('form-order-custname').value.trim();
        const oDate = document.getElementById('form-order-date').value;
        const oTotal = parseFloat(document.getElementById('form-order-total').value);
        const oPayMethod = document.getElementById('form-order-paymethod').value.trim();
        const oPayStatus = document.getElementById('form-order-paystatus').value;
        const oDelivStatus = document.getElementById('form-order-delivstatus').value;
        
        payload = {
            customer_name: oCustName,
            order_date: oDate,
            total_amount: oTotal,
            payment_method: oPayMethod,
            payment_status: oPayStatus,
            delivery_status: oDelivStatus
        };
        
        if (activeEditId) {
            url = `${API_BASE}/orders/update/${activeEditId}/`;
            method = "PUT";
        }
    }
    
    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            showToast(`${activeTab.slice(0, -1)} ${activeEditId ? 'updated' : 'added'} successfully!`, "success");
            modal.classList.remove('active');
            
            // Reload active tab list
            if (activeTab === "products") fetchProductsAdmin();
            if (activeTab === "categories") fetchCategoriesAdmin();
            if (activeTab === "customers") fetchCustomersAdmin();
            if (activeTab === "orders") fetchOrdersAdmin();
        } else {
            const data = await res.json();
            showToast(data.error || "Form submission failed.", "error");
        }
    } catch (e) {
        showToast("Error processing request.", "error");
    }
}
