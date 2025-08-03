// Main JavaScript for Tim Warner's Teaching Robot Fleet

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Set active navigation item
    setActiveNavItem();
    
    // Initialize real-time updates
    initializeRealTimeUpdates();
});

function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath.startsWith('/robot') && href === '/robots')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initializeRealTimeUpdates() {
    // Check if we're on a page that needs real-time updates
    const isDashboard = window.location.pathname === '/';
    const isRobots = window.location.pathname === '/robots';
    const isMaintenance = window.location.pathname === '/maintenance';
    
    if (isDashboard || isRobots || isMaintenance) {
        // Update every 30 seconds
        setInterval(() => {
            if (typeof loadDashboardData === 'function') {
                loadDashboardData();
            }
            if (typeof loadRobots === 'function') {
                loadRobots();
            }
            if (typeof loadMaintenanceData === 'function') {
                loadMaintenanceData();
            }
        }, 30000);
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'Active': return 'badge status-badge status-active';
        case 'Maintenance': return 'badge status-badge status-maintenance';
        case 'Offline': return 'badge status-badge status-offline';
        default: return 'badge bg-secondary';
    }
}

function getBatteryProgressClass(level) {
    const numLevel = parseInt(level) || 0;
    if (numLevel >= 70) return 'battery-high';
    if (numLevel >= 30) return 'battery-medium';
    return 'battery-low';
}

function getStatusIcon(status) {
    switch(status) {
        case 'Active': return '<i class="bi bi-check-circle-fill me-1"></i>';
        case 'Maintenance': return '<i class="bi bi-exclamation-triangle-fill me-1"></i>';
        case 'Offline': return '<i class="bi bi-x-circle-fill me-1"></i>';
        default: return '<i class="bi bi-question-circle-fill me-1"></i>';
    }
}

function getBatteryIcon(level) {
    const numLevel = parseInt(level) || 0;
    if (numLevel >= 75) return '<i class="bi bi-battery-full text-white"></i>';
    if (numLevel >= 50) return '<i class="bi bi-battery-half text-white"></i>';
    if (numLevel >= 25) return '<i class="bi bi-battery text-white"></i>';
    return '<i class="bi bi-battery text-white"></i>';
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div class="toast align-items-center text-white bg-${type} border-0" id="${toastId}" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1055';
    document.body.appendChild(container);
    return container;
}

// API helper functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        showToast(`API Error: ${error.message}`, 'danger');
        throw error;
    }
}

// Robot management functions
async function createRobot(robotData) {
    return await apiRequest('/api/robots', {
        method: 'POST',
        body: JSON.stringify(robotData)
    });
}

async function updateRobot(id, robotData) {
    return await apiRequest(`/api/robots/${id}`, {
        method: 'PUT',
        body: JSON.stringify(robotData)
    });
}

async function deleteRobot(id) {
    return await apiRequest(`/api/robots/${id}`, {
        method: 'DELETE'
    });
}

async function getRobot(id) {
    return await apiRequest(`/api/robots/${id}`);
}

async function getAllRobots() {
    return await apiRequest('/api/robots');
}

// Maintenance functions
async function logMaintenance(robotId, maintenanceData) {
    return await apiRequest(`/api/robots/${robotId}/maintenance`, {
        method: 'POST',
        body: JSON.stringify(maintenanceData)
    });
}

// Health check function
async function checkHealth() {
    try {
        const health = await apiRequest('/api/health/detailed');
        return health;
    } catch (error) {
        console.error('Health check failed:', error);
        return null;
    }
}

// Form validation helpers
function validateRobotForm(formData) {
    const errors = [];
    
    if (!formData.name || formData.name.length < 3) {
        errors.push('Robot name must be at least 3 characters long');
    }
    
    if (!formData.model) {
        errors.push('Robot model is required');
    }
    
    if (!formData.status) {
        errors.push('Robot status is required');
    }
    
    if (formData.battery_level && (formData.battery_level < 0 || formData.battery_level > 100)) {
        errors.push('Battery level must be between 0 and 100');
    }
    
    return errors;
}

// Data refresh functions
function refreshCurrentPage() {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/') {
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
    } else if (currentPath === '/robots') {
        if (typeof loadRobots === 'function') {
            loadRobots();
        }
    } else if (currentPath === '/maintenance') {
        if (typeof loadMaintenanceData === 'function') {
            loadMaintenanceData();
        }
    } else if (currentPath.startsWith('/robot/')) {
        if (typeof loadRobotDetails === 'function') {
            loadRobotDetails();
        }
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + R to refresh data
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshCurrentPage();
        showToast('Data refreshed', 'success');
    }
    
    // Esc to close modals
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
});

// Export functions for use in other scripts
window.RobotFleet = {
    apiRequest,
    createRobot,
    updateRobot,
    deleteRobot,
    getRobot,
    getAllRobots,
    logMaintenance,
    checkHealth,
    validateRobotForm,
    showToast,
    formatDate,
    formatDateTime,
    getStatusBadgeClass,
    getBatteryProgressClass,
    refreshCurrentPage
};