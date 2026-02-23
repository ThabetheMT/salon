// ========== API CONFIGURATION ==========
const API_BASE_URL = 'http://localhost:6060/api'; // Change to your backend URL

const API = {
    login: `${API_BASE_URL}/auth/login`,
    signup: `${API_BASE_URL}/auth/signup`,
    logout: `${API_BASE_URL}/auth/logout`,
    refreshToken: `${API_BASE_URL}/auth/refresh`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    services: `${API_BASE_URL}/services`,
    appointments: `${API_BASE_URL}/appointments`,
    currentUser: `${API_BASE_URL}/users/me`,
    customers: `${API_BASE_URL}/customers`,
    stylists: `${API_BASE_URL}/stylists`,
    managers: `${API_BASE_URL}/managers`,
    customerDashboard: (id) => `${API_BASE_URL}/customers/${id}/dashboard`,
    stylistDashboard: (id) => `${API_BASE_URL}/stylists/${id}/dashboard`,
    managerDashboard: `${API_BASE_URL}/manager/dashboard`,
    adminDashboard: `${API_BASE_URL}/admin/dashboard`,
    stylistAvailability: (id) => `${API_BASE_URL}/stylists/${id}/availability`,
    inventory: `${API_BASE_URL}/inventory`,
    lowStock: `${API_BASE_URL}/inventory/low-stock`,
    analytics: `${API_BASE_URL}/admin/analytics`
};

// ========== STATE MANAGEMENT ==========
let currentUser = null;
let accessToken = sessionStorage.getItem('accessToken') || null;
let refreshToken = sessionStorage.getItem('refreshToken') || null;
let revenueChart = null;
let stylistChart = null;

// ========== PAGE LOADING ==========
async function loadPage(pageName) {
    const contentDiv = document.getElementById('page-content');
    contentDiv.innerHTML = '<div style="text-align: center; padding: 3rem;"><div class="loading-spinner"></div><p>Loading...</p></div>';

    try {
        const response = await fetch(`pages/${pageName}.html`);
        const html = await response.text();
        contentDiv.innerHTML = html;

        // Update URL without reload
        history.pushState({ page: pageName }, '', `#${pageName}`);

        // Initialize page-specific functions
        if (pageName === 'home') {
            loadHomePageData();
            initGalleryScroll();
        } else if (pageName === 'customer-dashboard') {
            loadCustomerDashboard();
        } else if (pageName === 'stylist-dashboard') {
            loadStylistDashboard();
        } else if (pageName === 'manager-dashboard') {
            loadManagerDashboard();
        } else if (pageName === 'admin-dashboard') {
            loadAdminDashboard();
        } else if (pageName === 'signup') {
            initSignupValidation();
        }
    } catch (error) {
        console.error('Error loading page:', error);
        contentDiv.innerHTML = '<div class="error-message">Error loading page. Please try again.</div>';
    }
}

function navigateTo(page) {
    if (page === 'home') {
        loadPage('home');
    } else if (page === 'login') {
        loadPage('login');
    } else if (page === 'signup') {
        loadPage('signup');
    } else if (page === 'forgot-password') {
        loadPage('forgot-password');
    } else if (page === 'customer-dashboard' && currentUser) {
        loadPage('customer-dashboard');
    } else if (page === 'stylist-dashboard' && currentUser) {
        loadPage('stylist-dashboard');
    } else if (page === 'manager-dashboard' && currentUser) {
        loadPage('manager-dashboard');
    } else if (page === 'admin-dashboard' && currentUser) {
        loadPage('admin-dashboard');
    } else {
        loadPage('home');
    }
}

// ========== NAVBAR LOADING ==========
async function loadNavbar() {
    try {
        const response = await fetch('components/navbar.html');
        const html = await response.text();
        document.getElementById('navbar-container').innerHTML = html;

        // Update navbar based on login state
        updateNavbarForUser();
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

async function loadFooter() {
    try {
        const response = await fetch('components/footer.html');
        const html = await response.text();
        document.getElementById('footer-container').innerHTML = html;
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

function updateNavbarForUser() {
    const loginLink = document.getElementById('loginLink');
    const userBadge = document.getElementById('userBadge');
    const userName = document.getElementById('userName');

    if (currentUser) {
        loginLink.style.display = 'none';
        userBadge.style.display = 'flex';
        userName.textContent = currentUser.name;
    } else {
        loginLink.style.display = 'block';
        userBadge.style.display = 'none';
    }
}

function showUserDashboard() {
    if (currentUser?.role === 'ADMIN') {
        navigateTo('admin-dashboard');
    } else if (currentUser?.role === 'MANAGER') {
        navigateTo('manager-dashboard');
    } else if (currentUser?.role === 'STYLIST') {
        navigateTo('stylist-dashboard');
    } else {
        navigateTo('customer-dashboard');
    }
}

// ========== AUTH API CALLS ==========
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': accessToken ? `Bearer ${accessToken}` : ''
    };
}

async function apiCall(url, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: getAuthHeaders()
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return apiCall(url, method, body);
            } else {
                logout();
                throw new Error('Session expired. Please login again.');
            }
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API call failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showError(error.message);
        throw error;
    }
}

async function refreshAccessToken() {
    try {
        const response = await fetch(API.refreshToken, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            accessToken = data.accessToken;
            sessionStorage.setItem('accessToken', accessToken);
            return true;
        }
    } catch (error) {
        console.error('Refresh token failed:', error);
    }
    return false;
}

// ========== AUTH FUNCTIONS ==========
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    const loginBtn = document.getElementById('loginButton');
    loginBtn.innerHTML = '<span class="loading-spinner"></span> Logging in...';
    loginBtn.disabled = true;

    try {
        const response = await fetch(API.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, rememberMe })
        });

        if (!response.ok) {
            throw new Error('Invalid email or password');
        }

        const data = await response.json();
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
        currentUser = data.user;

        sessionStorage.setItem('accessToken', accessToken);
        if (rememberMe) {
            sessionStorage.setItem('refreshToken', refreshToken);
        }

        updateNavbarForUser();
        showUserDashboard();
    } catch (error) {
        alert(error.message);
    } finally {
        loginBtn.innerHTML = 'Log in';
        loginBtn.disabled = false;
    }
}

async function handleSignup() {
    const fullName = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const terms = document.getElementById('termsCheckbox').checked;

    if (!terms) {
        alert('Please agree to the Terms & Conditions');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const signupBtn = document.getElementById('signupBtn');
    signupBtn.innerHTML = '<span class="loading-spinner"></span> Creating account...';
    signupBtn.disabled = true;

    try {
        const response = await fetch(API.signup, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, phone, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Signup failed');
        }

        alert('Account created successfully! Please check your email to verify.');
        navigateTo('login');
    } catch (error) {
        alert(error.message);
    } finally {
        signupBtn.innerHTML = 'Create Account';
        signupBtn.disabled = false;
    }
}

async function requestPasswordReset() {
    const email = document.getElementById('resetEmail').value;
    const resetBtn = document.getElementById('resetBtn');

    resetBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
    resetBtn.disabled = true;

    try {
        const response = await fetch(API.forgotPassword, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            throw new Error('Failed to send reset email');
        }

        document.getElementById('resetStep1').style.display = 'none';
        document.getElementById('resetStep2').style.display = 'block';
        document.getElementById('sentEmail').textContent = email;
    } catch (error) {
        alert(error.message);
    } finally {
        resetBtn.innerHTML = 'Send Reset Link';
        resetBtn.disabled = false;
    }
}

function logout() {
    if (accessToken) {
        fetch(API.logout, {
            method: 'POST',
            headers: getAuthHeaders()
        }).catch(() => {});
    }

    accessToken = null;
    refreshToken = null;
    currentUser = null;

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');

    updateNavbarForUser();
    navigateTo('home');
}

// ========== SIGNUP VALIDATION ==========
function initSignupValidation() {
    const passwordInput = document.getElementById('signupPassword');
    const confirmInput = document.getElementById('signupConfirmPassword');

    if (passwordInput) {
        passwordInput.addEventListener('keyup', validatePassword);
    }
    if (confirmInput) {
        confirmInput.addEventListener('keyup', validatePasswordMatch);
    }
}

function validatePassword() {
    const password = document.getElementById('signupPassword').value;

    const reqLength = document.getElementById('reqLength');
    const reqNumber = document.getElementById('reqNumber');
    const reqUpper = document.getElementById('reqUpper');

    // Length check
    if (password.length >= 8) {
        reqLength.className = 'valid';
        reqLength.innerHTML = '<i class="fas fa-check"></i> At least 8 characters';
    } else {
        reqLength.className = 'invalid';
        reqLength.innerHTML = '<i class="fas fa-times"></i> At least 8 characters';
    }

    // Number check
    if (/\d/.test(password)) {
        reqNumber.className = 'valid';
        reqNumber.innerHTML = '<i class="fas fa-check"></i> At least 1 number';
    } else {
        reqNumber.className = 'invalid';
        reqNumber.innerHTML = '<i class="fas fa-times"></i> At least 1 number';
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
        reqUpper.className = 'valid';
        reqUpper.innerHTML = '<i class="fas fa-check"></i> At least 1 uppercase letter';
    } else {
        reqUpper.className = 'invalid';
        reqUpper.innerHTML = '<i class="fas fa-times"></i> At least 1 uppercase letter';
    }

    validatePasswordMatch();
}

function validatePasswordMatch() {
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirmPassword')?.value || '';
    const reqMatch = document.getElementById('reqMatch');

    if (password && confirm && password === confirm) {
        reqMatch.className = 'valid';
        reqMatch.innerHTML = '<i class="fas fa-check"></i> Passwords match';
    } else {
        reqMatch.className = 'invalid';
        reqMatch.innerHTML = '<i class="fas fa-times"></i> Passwords match';
    }
}

// ========== HOME PAGE ==========
async function loadHomePageData() {
    try {
        const services = await apiCall(API.services);
        renderServices(services);

        // Load services for booking modal
        const serviceSelect = document.getElementById('serviceSelect');
        if (serviceSelect) {
            serviceSelect.innerHTML = '<option value="">Choose a service</option>';
            services.forEach(service => {
                serviceSelect.innerHTML += `<option value="${service.id}">${service.name} - $${service.price}+</option>`;
            });
        }

        // Load stylists for booking modal
        const stylists = await apiCall(API.stylists);
        const stylistSelect = document.getElementById('stylistSelect');
        if (stylistSelect) {
            stylistSelect.innerHTML = '<option value="">Any available stylist</option>';
            stylists.forEach(stylist => {
                stylistSelect.innerHTML += `<option value="${stylist.id}">${stylist.name} (${stylist.specialty})</option>`;
            });
        }
    } catch (error) {
        console.error('Failed to load home page data:', error);
    }
}

function renderServices(services) {
    const container = document.getElementById('servicesContainer');
    if (!container) return;

    if (!services || services.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No services available</p>';
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="service-card" onclick="quickBook(${service.id})">
            <img src="${service.imageUrl || 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&q=80'}" alt="${service.name}">
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <small>From $${service.price} →</small>
        </div>
    `).join('');
}

// ========== GALLERY ==========
function initGalleryScroll() {
    const track = document.getElementById('galleryTrack');
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');

    if (track && scrollLeftBtn && scrollRightBtn) {
        const scrollAmount = 300;
        scrollLeftBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        scrollRightBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}

// ========== CUSTOMER DASHBOARD ==========
async function loadCustomerDashboard() {
    if (!currentUser) {
        navigateTo('login');
        return;
    }

    try {
        const dashboard = await apiCall(API.customerDashboard(currentUser.id));

        document.getElementById('customerName').textContent = dashboard.customer.name;
        document.getElementById('membershipLevel').textContent = dashboard.membership.level;
        document.getElementById('loyaltyPoints').textContent = dashboard.membership.points;
        document.getElementById('nextReward').textContent = dashboard.membership.nextReward;

        renderUpcomingAppointments(dashboard.upcomingAppointments);
        renderAppointmentHistory(dashboard.appointmentHistory);
        renderFavorites(dashboard.favorites);
        renderOffers(dashboard.offers);
    } catch (error) {
        console.error('Failed to load customer dashboard:', error);
    }
}

function renderUpcomingAppointments(appointments) {
    const container = document.getElementById('upcomingAppointments');
    if (!container) return;

    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #8b6f5a;">No upcoming appointments</p>';
        return;
    }

    container.innerHTML = appointments.map(apt => `
        <div class="appointment-item">
            <div class="appointment-info">
                <h4>${apt.serviceName}</h4>
                <p>${new Date(apt.dateTime).toLocaleString()} • with ${apt.stylistName}</p>
            </div>
            <span class="appointment-status status-${apt.status.toLowerCase()}">${apt.status}</span>
        </div>
    `).join('');
}

function renderAppointmentHistory(history) {
    const container = document.getElementById('appointmentHistory');
    if (!container) return;

    if (!history || history.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #8b6f5a;">No appointment history</p>';
        return;
    }

    container.innerHTML = history.map(apt => `
        <div class="appointment-item">
            <div class="appointment-info">
                <h4>${apt.serviceName}</h4>
                <p>${new Date(apt.dateTime).toLocaleDateString()} • with ${apt.stylistName}</p>
            </div>
            <span class="status-completed">Completed</span>
        </div>
    `).join('');
}

function renderFavorites(favorites) {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;

    if (!favorites || favorites.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #8b6f5a;">No favorites yet</p>';
        return;
    }

    container.innerHTML = favorites.map(fav => `
        <div class="favorite-item" onclick="quickBook(${fav.serviceId})">
            <i class="fas fa-${fav.icon}"></i>
            <span>${fav.name}</span>
            <small>${fav.stylistName}</small>
        </div>
    `).join('');
}

function renderOffers(offers) {
    const container = document.getElementById('offersContainer');
    if (!container) return;

    if (!offers || offers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #8b6f5a;">No offers available</p>';
        return;
    }

    container.innerHTML = offers.map(offer => `
        <p><i class="fas fa-tag" style="color: var(--caramel);"></i> ${offer.description}</p>
    `).join('');
}

// ========== STYLIST DASHBOARD ==========
async function loadStylistDashboard() {
    if (!currentUser) {
        navigateTo('login');
        return;
    }

    try {
        const dashboard = await apiCall(API.stylistDashboard(currentUser.id));

        document.getElementById('stylistName').textContent = dashboard.stylist.name;
        document.getElementById('stylistSpecialty').textContent = dashboard.stylist.specialty;
        document.getElementById('stylistRating').textContent = dashboard.stylist.rating;
        document.getElementById('stylistReviewCount').textContent = `from ${dashboard.stylist.reviewCount} reviews`;

        document.getElementById('todayAppointments').textContent = dashboard.stats.todayAppointments;
        document.getElementById('hoursLeft').textContent = dashboard.stats.hoursLeft;
        document.getElementById('todayEarnings').textContent = `$${dashboard.stats.todayEarnings}`;
        document.getElementById('weeklyAppointments').textContent = dashboard.stats.weeklyAppointments;

        renderTodaySchedule(dashboard.todaySchedule);
        renderAvailability(dashboard.availability);
        initStylistChart(dashboard.weeklyData);
    } catch (error) {
        console.error('Failed to load stylist dashboard:', error);
    }
}

function renderTodaySchedule(schedule) {
    const container = document.getElementById('todaySchedule');
    if (!container) return;

    if (!schedule || schedule.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #8b6f5a;">No appointments today</p>';
        return;
    }

    container.innerHTML = schedule.map(slot => {
        if (slot.isBreak) {
            return `
                <div class="slot-item">
                    <span class="slot-time">${slot.time}</span>
                    <div class="slot-client">
                        <span style="color: var(--caramel);">Lunch Break</span>
                    </div>
                    <div class="slot-actions">
                        <span class="badge">${slot.duration} min</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="slot-item">
                <span class="slot-time">${slot.time}</span>
                <div class="slot-client">
                    <strong>${slot.clientName}</strong>
                    <span class="slot-service">${slot.serviceName}</span>
                </div>
                <div class="slot-actions">
                    <button onclick="startAppointment(${slot.id})" title="Start"><i class="fas fa-play"></i></button>
                    <button onclick="rescheduleAppointment(${slot.id})" title="Reschedule"><i class="fas fa-clock"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function renderAvailability(availability) {
    const container = document.getElementById('availabilityContainer');
    if (!container) return;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    container.innerHTML = days.map((day, index) => `
        <div class="day-toggle">
            <span class="day-name">${day}</span>
            <label class="switch">
                <input type="checkbox" ${availability[index] ? 'checked' : ''} onchange="toggleAvailability(${index})">
                <span class="slider"></span>
            </label>
        </div>
    `).join('');
}

function initStylistChart(weeklyData) {
    const ctx = document.getElementById('stylistChart')?.getContext('2d');
    if (!ctx) return;

    if (stylistChart) {
        stylistChart.destroy();
    }

    stylistChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weeklyData.labels,
            datasets: [{
                label: 'Appointments',
                data: weeklyData.values,
                backgroundColor: '#d9a87e',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f3d5b9' }
                }
            }
        }
    });
}

// ========== MANAGER DASHBOARD ==========
async function loadManagerDashboard() {
    if (!currentUser) {
        navigateTo('login');
        return;
    }

    try {
        const dashboard = await apiCall(API.managerDashboard);

        document.getElementById('managerName').textContent = dashboard.manager.name;

        renderManagerStats(dashboard.stats);
        renderStaffOnDuty(dashboard.staff);
        renderInventoryAlerts(dashboard.inventory);
        renderTodayOverview(dashboard.overview);
    } catch (error) {
        console.error('Failed to load manager dashboard:', error);
    }
}

function renderManagerStats(stats) {
    const container = document.getElementById('managerStats');
    if (!container) return;

    container.innerHTML = `
        <div class="manager-stat-card">
            <div class="manager-stat-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="manager-stat-info">
                <h3>${stats.todayAppointments}</h3>
                <p>Today's Appointments</p>
            </div>
        </div>
        <div class="manager-stat-card">
            <div class="manager-stat-icon"><i class="fas fa-user-check"></i></div>
            <div class="manager-stat-info">
                <h3>${stats.staffWorking}/${stats.totalStaff}</h3>
                <p>Stylists Working</p>
            </div>
        </div>
        <div class="manager-stat-card">
            <div class="manager-stat-icon"><i class="fas fa-clock"></i></div>
            <div class="manager-stat-info">
                <h3>${stats.lateAppointments}</h3>
                <p>Late Appointments</p>
            </div>
        </div>
        <div class="manager-stat-card">
            <div class="manager-stat-icon"><i class="fas fa-box"></i></div>
            <div class="manager-stat-info">
                <h3>${stats.lowStockItems}</h3>
                <p>Low Stock Items</p>
            </div>
        </div>
    `;
}

function renderStaffOnDuty(staff) {
    const container = document.getElementById('staffOnDuty');
    if (!container) return;

    container.innerHTML = staff.map(s => `
        <div class="staff-item">
            <div class="staff-info">
                <div class="staff-avatar"><i class="fas fa-user"></i></div>
                <div class="staff-details">
                    <h4>${s.name}</h4>
                    <p>${s.specialty} • ${s.appointmentsToday} appts today</p>
                </div>
            </div>
            <span class="staff-status status-${s.status.toLowerCase()}">${s.status}</span>
        </div>
    `).join('');
}

function renderInventoryAlerts(inventory) {
    const container = document.getElementById('inventoryAlerts');
    if (!container) return;

    container.innerHTML = inventory.map(item => `
        <div class="inventory-item">
            <span class="inventory-name">${item.name}</span>
            <div class="inventory-stock">
                <div class="stock-bar">
                    <div class="stock-fill" style="width: ${item.stockLevel}%;"></div>
                </div>
                <span class="${item.stockLevel < 20 ? 'low-stock' : ''}">${item.stockLevel}%</span>
            </div>
        </div>
    `).join('');
}

function renderTodayOverview(overview) {
    const container = document.getElementById('todayOverview');
    if (!container) return;

    const percentage = (overview.currentRevenue / overview.dailyGoal) * 100;

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; text-align: center;">
            <div>
                <div style="font-size: 2rem; color: var(--manager); font-weight: 700;">${overview.completed}</div>
                <div style="color: #8b6f5a;">Completed</div>
            </div>
            <div>
                <div style="font-size: 2rem; color: var(--manager); font-weight: 700;">${overview.inProgress}</div>
                <div style="color: #8b6f5a;">In Progress</div>
            </div>
            <div>
                <div style="font-size: 2rem; color: var(--manager); font-weight: 700;">${overview.upcoming}</div>
                <div style="color: #8b6f5a;">Upcoming</div>
            </div>
        </div>
        <div style="margin-top: 1.5rem; background: var(--manager-light); padding: 1rem; border-radius: 20px;">
            <p><i class="fas fa-circle-check" style="color: var(--success);"></i> On track for daily goal: $${overview.currentRevenue} / $${overview.dailyGoal}</p>
            <div class="stock-bar" style="width: 100%; margin-top: 0.5rem;">
                <div class="stock-fill" style="width: ${percentage}%; background: var(--manager);"></div>
            </div>
        </div>
    `;
}

// ========== ADMIN DASHBOARD ==========
async function loadAdminDashboard() {
    if (!currentUser) {
        navigateTo('login');
        return;
    }

    try {
        const dashboard = await apiCall(API.adminDashboard);

        document.getElementById('adminName').textContent = dashboard.admin.name;

        renderAdminStats(dashboard.stats);
        renderAppointmentsTable(dashboard.appointments);
        renderCustomersTable(dashboard.customers);
        renderStylistsTable(dashboard.stylists);
        renderManagersTable(dashboard.managers);
        renderServicesTable(dashboard.services);
        renderAnalytics(dashboard.analytics);

        initRevenueChart(dashboard.analytics.revenueData);
    } catch (error) {
        console.error('Failed to load admin dashboard:', error);
    }
}

function renderAdminStats(stats) {
    const container = document.getElementById('adminStats');
    if (!container) return;

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-info">
                <h3>${stats.todayAppointments}</h3>
                <p>Today's Appointments</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div class="stat-info">
                <h3>${stats.totalCustomers}</h3>
                <p>Total Customers</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-user-tie"></i></div>
            <div class="stat-info">
                <h3>${stats.activeStylists}</h3>
                <p>Active Stylists</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            <div class="stat-info">
                <h3>$${stats.todayRevenue}</h3>
                <p>Today's Revenue</p>
            </div>
        </div>
    `;
}

function renderAppointmentsTable(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = appointments.map(apt => `
        <tr>
            <td>${apt.time}</td>
            <td>${apt.customerName}</td>
            <td>${apt.serviceName}</td>
            <td>${apt.stylistName}</td>
            <td><span class="appointment-status status-${apt.status.toLowerCase()}">${apt.status}</span></td>
            <td>
                <button class="action-btn edit" onclick="editAppointment(${apt.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteAppointment(${apt.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderCustomersTable(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td>${c.phone}</td>
            <td>${c.totalVisits}</td>
            <td>${c.favoriteStylist}</td>
            <td><button class="action-btn edit" onclick="editCustomer(${c.id})"><i class="fas fa-edit"></i></button></td>
        </tr>
    `).join('');
}

function renderStylistsTable(stylists) {
    const tbody = document.getElementById('stylistsTableBody');
    if (!tbody) return;

    tbody.innerHTML = stylists.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.specialty}</td>
            <td>${s.rating} ⭐</td>
            <td>${s.todayAppointments}</td>
            <td><span class="appointment-status status-${s.status.toLowerCase()}">${s.status}</span></td>
            <td><button class="action-btn edit" onclick="editStylist(${s.id})"><i class="fas fa-edit"></i></button></td>
        </tr>
    `).join('');
}

function renderManagersTable(managers) {
    const tbody = document.getElementById('managersTableBody');
    if (!tbody) return;

    tbody.innerHTML = managers.map(m => `
        <tr>
            <td>${m.name}</td>
            <td>${m.email}</td>
            <td>${m.phone}</td>
            <td>${m.store}</td>
            <td><span class="appointment-status status-${m.status.toLowerCase()}">${m.status}</span></td>
            <td>
                <button class="action-btn edit" onclick="editManager(${m.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn manager" onclick="viewManagerDashboard(${m.id})"><i class="fas fa-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderServicesTable(services) {
    const tbody = document.getElementById('servicesTableBody');
    if (!tbody) return;

    tbody.innerHTML = services.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.duration} min</td>
            <td>$${s.price}</td>
            <td>${'⭐'.repeat(s.popularity)}</td>
            <td><button class="action-btn edit" onclick="editService(${s.id})"><i class="fas fa-edit"></i></button></td>
        </tr>
    `).join('');
}

function renderAnalytics(analytics) {
    const popularServices = document.getElementById('popularServices');
    if (popularServices) {
        popularServices.innerHTML = analytics.popularServices.map(s => `
            <p style="margin: 0.8rem 0;"><i class="fas fa-${s.icon}" style="color: var(--caramel); width: 30px;"></i> ${s.name}: ${s.percentage}%</p>
        `).join('');
    }

    const topStylists = document.getElementById('topStylists');
    if (topStylists) {
        topStylists.innerHTML = analytics.topStylists.map(s => `
            <p style="margin: 0.8rem 0;"><i class="fas fa-star" style="color: var(--caramel);"></i> ${s.name}: ${s.bookings} bookings</p>
        `).join('');
    }
}

function initRevenueChart(revenueData) {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: revenueData.labels,
            datasets: [{
                label: 'Revenue ($)',
                data: revenueData.values,
                borderColor: '#d9a87e',
                backgroundColor: 'rgba(217, 168, 126, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#b37b56',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(tabName + 'Panel').classList.add('active');
}

// ========== BOOKING FUNCTIONS ==========
function openBookingModal() {
    // We'll need to implement a modal or navigate to booking page
    alert('Booking functionality will open here');
}

function quickBook(serviceId) {
    if (!currentUser) {
        if (confirm('Please login to book an appointment. Would you like to login now?')) {
            navigateTo('login');
        }
        return;
    }
    alert(`Quick book service ${serviceId}`);
}

function updateServiceDisplay() {
    const select = document.getElementById('serviceSelect');
    const display = document.getElementById('selectedServiceDisplay');
    if (select && display) {
        const selectedOption = select.options[select.selectedIndex];
        display.textContent = select.value ? selectedOption.text.split(' - ')[0] : 'Select a service';
    }
}

function updateTimeDisplay() {
    const date = document.getElementById('bookingDate')?.value;
    const time = document.getElementById('bookingTime')?.value;
    const display = document.getElementById('selectedTimeDisplay');

    if (!display) return;

    if (date && time) {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        display.textContent = `${formattedDate} at ${time}`;
    } else if (date) {
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        display.textContent = `${formattedDate} (select time)`;
    } else {
        display.textContent = 'Choose date & time';
    }
}

async function confirmBooking() {
    const serviceId = document.getElementById('serviceSelect')?.value;
    const stylistId = document.getElementById('stylistSelect')?.value;
    const date = document.getElementById('bookingDate')?.value;
    const time = document.getElementById('bookingTime')?.value;
    const name = document.getElementById('customerName')?.value;
    const phone = document.getElementById('customerPhone')?.value;

    if (!serviceId || !date || !time || !name || !phone) {
        alert('Please fill in all fields to complete your booking.');
        return;
    }

    try {
        const booking = {
            serviceId: parseInt(serviceId),
            stylistId: stylistId ? parseInt(stylistId) : null,
            dateTime: `${date}T${time}:00`,
            customerName: name,
            customerPhone: phone
        };

        await apiCall(API.appointments, 'POST', booking);

        alert('✨ Booking confirmed! We\'ll send a confirmation to your phone.');

        // Reset form
        document.getElementById('serviceSelect').value = '';
        document.getElementById('stylistSelect').value = '';
        document.getElementById('bookingDate').value = '';
        document.getElementById('bookingTime').value = '';
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        updateServiceDisplay();
        updateTimeDisplay();

        // Reload dashboard if logged in
        if (currentUser) {
            loadCustomerDashboard();
        }
    } catch (error) {
        alert('Failed to book appointment: ' + error.message);
    }
}

// ========== STYLIST ACTIONS ==========
async function startAppointment(appointmentId) {
    try {
        await apiCall(`${API.appointments}/${appointmentId}/start`, 'POST');
        alert('Appointment started!');
        loadStylistDashboard();
    } catch (error) {
        alert('Failed to start appointment: ' + error.message);
    }
}

async function rescheduleAppointment(appointmentId) {
    alert('Reschedule functionality would open here.');
}

async function toggleAvailability(dayIndex) {
    try {
        await apiCall(API.stylistAvailability(currentUser.id), 'PUT', {
            dayIndex,
            available: event.target.checked
        });
    } catch (error) {
        alert('Failed to update availability');
        event.target.checked = !event.target.checked;
    }
}

async function updateAvailability() {
    alert('Availability updated successfully!');
}

// ========== MANAGER ACTIONS ==========
async function reorderLowStock() {
    try {
        await apiCall(`${API.inventory}/reorder`, 'POST');
        alert('Reorder placed for low stock items!');
        loadManagerDashboard();
    } catch (error) {
        alert('Failed to reorder: ' + error.message);
    }
}

// ========== ADMIN ACTIONS ==========
async function editAppointment(id) {
    alert(`Edit appointment ${id}`);
}

async function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        try {
            await apiCall(`${API.appointments}/${id}`, 'DELETE');
            loadAdminDashboard();
        } catch (error) {
            alert('Failed to delete: ' + error.message);
        }
    }
}

async function editCustomer(id) {
    alert(`Edit customer ${id}`);
}

async function editStylist(id) {
    alert(`Edit stylist ${id}`);
}

async function editManager(id) {
    alert(`Edit manager ${id}`);
}

async function viewManagerDashboard(id) {
    alert(`View manager ${id} dashboard`);
}

async function editService(id) {
    alert(`Edit service ${id}`);
}

// ========== UTILITY FUNCTIONS ==========
function showError(message) {
    console.error(message);
    // You can implement a toast notification here
}

function showTerms() {
    alert('Terms and Conditions would open here');
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Load navbar and footer
    await loadNavbar();
    await loadFooter();

    // Check for existing session
    if (accessToken) {
        try {
            currentUser = await apiCall(API.currentUser);
            updateNavbarForUser();
        } catch (error) {
            accessToken = null;
            sessionStorage.removeItem('accessToken');
        }
    }

    // Load initial page based on URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        navigateTo(hash);
    } else {
        navigateTo('home');
    }

    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            loadPage(event.state.page);
        }
    });
});

// Make functions globally available
window.navigateTo = navigateTo;
window.showUserDashboard = showUserDashboard;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.requestPasswordReset = requestPasswordReset;
window.logout = logout;
window.quickBook = quickBook;
window.openBookingModal = openBookingModal;
window.updateServiceDisplay = updateServiceDisplay;
window.updateTimeDisplay = updateTimeDisplay;
window.confirmBooking = confirmBooking;
window.startAppointment = startAppointment;
window.rescheduleAppointment = rescheduleAppointment;
window.toggleAvailability = toggleAvailability;
window.updateAvailability = updateAvailability;
window.reorderLowStock = reorderLowStock;
window.switchAdminTab = switchAdminTab;
window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointment;
window.editCustomer = editCustomer;
window.editStylist = editStylist;
window.editManager = editManager;
window.viewManagerDashboard = viewManagerDashboard;
window.editService = editService;
window.showTerms = showTerms;