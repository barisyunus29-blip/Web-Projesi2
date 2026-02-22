/**
 * Araba Parçaları E-Ticaret Web Sitesi - Global JavaScript
 * GitHub Pages için düzeltilmiş versiyon
 */

const API_URL = '/Web-Projesi2/';

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
        window.location.href = `/Web-Projesi2/products.html?search=${encodeURIComponent(query)}`;
    }
}

async function login(email, password) {
    const result = await apiCall('api-users.php?action=login', 'POST', {
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
    const result = await apiCall('api-users.php?action=register', 'POST', {
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
    const result = await apiCall('api-users.php?action=logout', 'POST');
    
    if (result && result.success) {
        currentUser = null;
        localStorage.removeItem('user');
        updateUserUI();
        showNotification('Çıkış başarılı', 'success');
        setTimeout(() => {
            window.location.href = '/Web-Projesi2/index.html';
        }, 1000);
    }
}

async function loadProducts(page = 1, categoryId = null, search = null) {
    let endpoint = `api-products.php?action=list&page=${page}`;
    
    if (categoryId) {
        endpoint = `api-products.php?action=by_category&category_id=${categoryId}&page=${page}`;
    } else if (search) {
        endpoint = `api-products.php?action=search&query=${encodeURIComponent(search)}`;
    }
    
    const result = await apiCall(endpoint);
    
    if (result && result.success) {
        return result.data;
    }
    
    return null;
}

async function loadProductDetail(productId) {
    const result = await apiCall(`api-products.php?action=get&id=${productId}`);
    
    if (result && result.success) {
        return result.data;
    }
    
    return null;
}

async function loadCategories() {
    const result = await apiCall('api-products.php?action=categories');
    
    if (result && result.success) {
        return result.data.categories;
    }
    
    return [];
}

async function loadFeaturedProducts() {
    const result = await apiCall('api-products.php?action=featured');
    
    if (result && result.success) {
        return result.data.products;
    }
    
    return [];
}

async function addToCart(productId, quantity = 1) {
    if (!currentUser) {
        showNotification('Lütfen önce giriş yapın', 'warning');
        window.location.href = '/Web-Projesi2/login.html';
        return false;
    }
    
    const result = await apiCall('api-cart.php?action=add', 'POST', {
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
