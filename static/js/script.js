 JS
/**
 * Cricket League Management System - JavaScript
 * Client-side validation and interactions
 */
 
// ==================== NAVIGATION ====================
 
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
});
 
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
 
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
 
        // Close menu when link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}
 
// ==================== RESET TOURNAMENT ====================
 
async function resetTournament() {
    // Double confirmation
    if (!confirm('⚠️ Are you sure you want to RESET the entire tournament?')) {
        return;
    }
 
    if (!confirm('This will delete all matches and results. This action CANNOT be undone. Continue?')) {
        return;
    }
 
    try {
        const response = await fetch('/api/reset-tournament',{
    method:'POST'
})
.then(()=>{
    location.reload();
});
        const data = await response.json();
 
        if (data.success) {
            showNotification('success', 'Tournament reset successfully!');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            showNotification('error', data.error || 'Failed to reset tournament');
        }
    } catch (error) {
        showNotification('error', 'Error: ' + error.message);
    }
}
 
// ==================== NOTIFICATIONS ====================
 
function showNotification(type, message) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
 
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        ${message}
        <button class="alert-close" onclick="this.parentElement.remove();">&times;</button>
    `;
 
    mainContent.insertBefore(alert, mainContent.firstChild);
 
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}
 
// ==================== FORM VALIDATION ====================
 
/**
 * Validate email format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
 
/**
 * Validate cricket match inputs
 */
function validateMatchInput(runs, wickets, overs) {
    if (runs < 0) {
        return { valid: false, error: 'Runs cannot be negative' };
    }
 
    if (wickets < 0 || wickets > 10) {
        return { valid: false, error: 'Wickets must be between 0 and 10' };
    }
 
    if (overs < 0) {
        return { valid: false, error: 'Overs cannot be negative' };
    }
 
    // Check if overs format is valid (e.g., 18.3 means 18 overs 3 balls)
    const decimalPart = overs % 1;
    if (decimalPart > 0 && decimalPart >= 0.6) {
        return { valid: false, error: 'Invalid overs format. Balls should be 0-5 (e.g., 18.5 max)' };
    }
 
    return { valid: true };
}
 
// ==================== TABLE UTILITIES ====================
 
/**
 * Sort table by column
 */
function sortTable(columnIndex, isNumeric = true) {
    const table = document.querySelector('.points-table');
    if (!table) return;
 
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const isAscending = !table.dataset.sortAsc;
 
    rows.sort((a, b) => {
        let aVal = a.cells[columnIndex].textContent.trim();
        let bVal = b.cells[columnIndex].textContent.trim();
 
        if (isNumeric) {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        }
 
        return isAscending ? aVal - bVal : bVal - aVal;
    });
 
    const tbody = table.querySelector('tbody');
    rows.forEach(row => tbody.appendChild(row));
 
    table.dataset.sortAsc = isAscending;
}
 
/**
 * Export table to CSV
 */
function exportTableToCSV(filename = 'points_table.csv') {
    const table = document.querySelector('.points-table');
    if (!table) return;
 
    let csv = [];
    const rows = table.querySelectorAll('tr');
 
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = Array.from(cols).map(col => {
            let text = col.textContent.trim();
            // Escape quotes and wrap in quotes if contains comma
            if (text.includes(',') || text.includes('"')) {
                text = '"' + text.replace(/"/g, '""') + '"';
            }
            return text;
        });
        csv.push(csvRow.join(','));
    });
 
    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', filename);
    link.click();
}
 
// ==================== FIXTURES FILTER ====================
 
/**
 * Filter fixtures by status
 */
function filterFixtures(status) {
    const cards = document.querySelectorAll('.fixture-card');
    const buttons = document.querySelectorAll('.filter-btn');
 
    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
 
    // Filter cards
    cards.forEach(card => {
        if (status === 'all') {
            card.style.display = 'block';
        } else {
            card.style.display = card.dataset.status === status ? 'block' : 'none';
        }
    });
}
 
// ==================== NRR CALCULATION ====================
 
/**
 * Calculate NRR for display purposes
 */
function calculateNRR(runsFor, oversFaced, runsAgainst, oversBowled) {
    if (oversFaced === 0 || oversBowled === 0) return 0;
 
    const runRateFor = runsFor / oversFaced;
    const runRateAgainst = runsAgainst / oversBowled;
    const nrr = runRateFor - runRateAgainst;
 
    return parseFloat(nrr.toFixed(2));
}
 
/**
 * Convert overs to decimal (e.g., 18.3 = 18 overs 3 balls)
 */
function oversToDecimal(overs) {
    const whole = Math.floor(overs);
    const decimal = overs % 1;
    const balls = Math.round(decimal * 10);
 
    if (balls > 5) {
        return whole + 1;
    }
 
    return whole + (balls / 10);
}
 
/**
 * Convert decimal to overs format (e.g., 18.3 = 18 overs 3 balls)
 */
function decimalToOvers(decimal) {
    const whole = Math.floor(decimal);
    const balls = Math.round((decimal % 1) * 10);
 
    return `${whole}.${balls}`;
}
 
// ==================== STORAGE UTILITIES ====================
 
/**
 * Save data to localStorage
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
        return false;
    }
}
 
/**
 * Get data from localStorage
 */
function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Failed to get from localStorage:', e);
        return null;
    }
}
 
/**
 * Remove data from localStorage
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('Failed to remove from localStorage:', e);
        return false;
    }
}
 
// ==================== DATE UTILITIES ====================
 
/**
 * Format date for display
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
 
/**
 * Get relative time (e.g., "2 hours ago")
 */
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
 
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
 
    return formatDate(dateString);
}
 
// ==================== PRINT FUNCTIONALITY ====================
 
/**
 * Print points table
 */
function printPointsTable() {
    const printWindow = window.open('', '', 'height=600,width=800');
    const table = document.querySelector('.points-table');
 
    if (!table) return;
 
    const title = document.querySelector('h2')?.textContent || 'Points Table';
 
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { text-align: center; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 10px; text-align: center; border: 1px solid #ddd; }
                th { background-color: #366092; color: white; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            ${table.outerHTML}
            <div class="footer">
                <p>Printed on ${new Date().toLocaleDateString()}</p>
                <p>Cricket League Management System</p>
            </div>
        </body>
        </html>
    `);
 
    printWindow.document.close();
    printWindow.print();
}
 
// ==================== SEARCH & FILTER ====================
 
/**
 * Search in table
 */
function searchTable(searchTerm) {
    const rows = document.querySelectorAll('.points-table tbody tr');
    const term = searchTerm.toLowerCase();
 
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}
 
// ==================== CONFIRMATION DIALOGS ====================
 
/**
 * Show confirmation dialog
 */
function showConfirmDialog(title, message, onConfirm, onCancel) {
    const confirmed = confirm(`${title}\n\n${message}`);
 
    if (confirmed) {
        onConfirm?.();
    } else {
        onCancel?.();
    }
}
 
// ==================== LOADING INDICATORS ====================
 
/**
 * Show loading spinner
 */
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 9999;
        ">
            <div style="
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #0066cc;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            "></div>
            <p style="text-align: center; margin-top: 15px; color: #666;">Loading...</p>
        </div>
    `;
 
    document.body.appendChild(loader);
}
 
/**
 * Hide loading spinner
 */
function hideLoading() {
    const loader = document.getElementById('loader');
    if (loader) loader.remove();
}
 
// ==================== API HELPERS ====================
 
/**
 * Fetch with error handling
 */
async function fetchAPI(url, options = {}) {
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
            throw new Error(data.error || 'API request failed');
        }
 
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
 
// ==================== KEYBOARD SHORTCUTS ====================
 
/**
 * Setup keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save (prevent browser save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Form submission handled by forms
    }
 
    // Escape to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"]');
        modals.forEach(modal => modal.remove());
    }
});
 
// ==================== ANIMATIONS ====================
 
// Add spinner animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
 
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
 
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
 
    .fade-in {
        animation: fadeIn 0.3s ease;
    }
`;
document.head.appendChild(style);
 
// Log initialization
console.log('Cricket League Management System - JavaScript loaded');