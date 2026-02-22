/**
 * Araba Parçaları E-Ticaret Web Sitesi - Global JavaScript
 */

const API_URL = '';

let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    initializeEventListeners();
});

function loadUserInfo() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
        updateUserUI();
    }
}

function updateUserUI() {
    const loginBtn = document.getElementById('login-btn');
    const userMenu = document.getElementById('user-menu');
    
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'block';
            const userName = document.getElementById('user-name');
            if (userName) userName.textContent = currentUser.name;
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function initializeEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
}

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(API_URL + endpoint, options);
        const result = await response.json();
        
        if (!result.success && result.message === 'Oturum süresi doldu') {
            logout();
            return null;
        }
        
        return result;
    } catch (error) {
        console.error('API Hatası:', error);
        showNotification('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.', 'error');
        return null;
    }
}

function showNotification(message, type = 'info') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `alert alert-${type}`;
    notificationDiv.textContent = message;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(notificationDiv, container.firstChild);
    
    setTimeout(() => {
        notificationDiv.remove();
    }, 5000);
}

function handleSearch(e) {
    e.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    
    if (query) {
        window.location.href = `/products.html?search=${encodeURIComponent(query)}`;
    }
}

async function login(email, password) {
    const result = await apiCall('/api-users.php?action=login', 'POST', {
        email: email,
        password: password
    });
    
    if (result && result.success) {
        currentUser = result.data;
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUserUI();
        showNotification('Giriş başarılı!', 'success');
        return true;
    } else {
        showNotification(result?.message || 'Giriş başarısız', 'error');
        return false;
    }
}

async function register(email, password, passwordConfirm, name) {
    const result = await apiCall('/api-users.php?action=register', 'POST', {
        email: email,
        password: password,
        password_confirm: passwordConfirm,
        name: name
    });
    
    if (result && result.success) {
        showNotification('Kayıt başarılı! Lütfen giriş yapın.', 'success');
        return true;
    } else {
        showNotification(result?.message || 'Kayıt başarısız', 'error');
        return false;
    }
}

async function logout() {
    const result = await apiCall('/api-users.php?action=logout', 'POST');
    
    if (result && result.success) {
        currentUser = null;
        localStorage.removeItem('user');
        updateUserUI();
        showNotification('Çıkış başarılı', 'success');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1000);
    }
}

async function loadProducts(page = 1, categoryId = null, search = null) {
    let endpoint = `/api-products.php?action=list&page=${page}`;
    
    if (categoryId) {
        endpoint = `/api-products.php?action=by_category&category_id=${categoryId}&page=${page}`;
    } else if (search) {
        endpoint = `/api-products.php?action=search&query=${encodeURIComponent(search)}`;
    }
    
    const result = await apiCall(endpoint);
    
    if (result && result.success) {
        return result.data;
    }
    
    return null;
}

async function loadProductDetail(productId) {
    const result = await apiCall(`/api-products.php?action=get&id=${productId}`);
    
    if (result && result.success) {
        return result.data;
    }
    
    return null;
}

async function loadCategories() {
    const result = await apiCall('/api-products.php?action=categories');
    
    if (result && result.success) {
        return result.data.categories;
    }
    
    return [];
}

async function loadFeaturedProducts() {
    const result = await apiCall('/api-products.php?action=featured');
    
    if (result && result.success) {
        return result.data.products;
    }
    
    return [];
}

async function addToCart(productId, quantity = 1) {
    if (!currentUser) {
        showNotification('Lütfen önce giriş yapın', 'warning');
        window.location.href = '/login.html';
        return false;
    }
    
    const result = await apiCall('/api-cart.php?action=add', 'POST', {
        product_id: productId,
        quantity: quantity
    });
    
    if (result && result.success) {
        showNotification('Ürün sepete eklendi!', 'success');
        return true;
    } else {
        showNotification(result?.message || 'Ürün eklenemedi', 'error');
        return false;
    }
}

async function loadCart() {
    if (!currentUser) {
        return null;
    }
    
    const result = await apiCall('/api-cart.php?action=list');
    
    if (result && result.success) {
        return result.data;
    }
    
    return null;
}

async function removeFromCart(cartId) {
    const result = await apiCall('/api-cart.php?action=remove', 'POST', {
        cart_id: cartId
    });
    
    if (result && result.success) {
        showNotification('Ürün sepetten çıkarıldı', 'success');
        return true;
    } else {
        showNotification(result?.message || 'İşlem başarısız', 'error');
        return false;
    }
}

async function updateCartItem(cartId, quantity) {
    const result = await apiCall('/api-cart.php?action=update', 'POST', {
        cart_id: cartId,
        quantity: quantity
    });
    
    if (result && result.success) {
        return true;
    } else {
        showNotification(result?.message || 'İşlem başarısız', 'error');
        return false;
    }
}

async function createOrder(shippingAddress, shippingCity, shippingPostalCode, paymentMethod = 'credit_card', notes = '') {
    if (!currentUser) {
        showNotification('Lütfen giriş yapın', 'warning');
        return false;
    }
    
    const result = await apiCall('/api-orders.php?action=create', 'POST', {
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_postal_code: shippingPostalCode,
        payment_method: paymentMethod,
        notes: notes
    });
    
    if (result && result.success) {
        showNotification('Sipariş başarıyla oluşturuldu!', 'success');
        return result.data;
    } else {
        showNotification(result?.message || 'Sipariş oluşturulamadı', 'error');
        return false;
    }
}

async function loadOrders(page = 1) {
    if (!currentUser) {
        return null;
    }
    
    const result = await apiCall(`/api-orders.php?action=list&page=${page}`);
    
    if (result && result.success) {
        return result.data;
    }
    
    return null;
}

async function submitContactForm(name, email, phone, subject, message) {
    const result = await apiCall('/api-contact.php?action=submit', 'POST', {
        name: name,
        email: email,
        phone: phone,
        subject: subject,
        message: message
    });
    
    if (result && result.success) {
        showNotification('Mesajınız başarıyla gönderildi!', 'success');
        return true;
    } else {
        showNotification(result?.message || 'Mesaj gönderilemedi', 'error');
        return false;
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image_url || '/placeholder.jpg'}" alt="${product.name}">
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-stock">
                    ${product.stock > 0 ? `Stokta: ${product.stock}` : 'Tükendi'}
                </div>
                <p class="product-description">${product.description?.substring(0, 100) || ''}...</p>
                <button class="btn btn-small btn-block" onclick="addToCart(${product.id})">SEPETE EKLE</button>
            </div>
        </div>
    `;
}

function getPageNumber() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('page')) || 1;
}

function getCategoryId() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('category')) || null;
}

function getSearchQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || null;
}
