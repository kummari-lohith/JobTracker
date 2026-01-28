// ===================================
// JOB APPLICATION TRACKER
// Modular JavaScript Application
// ===================================

(function() {
    'use strict';

    // ===================================
    // STORAGE LAYER
    // ===================================
    
    const Storage = {
        KEYS: {
            JOBS: 'jobtracker_jobs',
            THEME: 'jobtracker_theme',
            ONBOARDING: 'jobtracker_onboarding_complete'
        },

        get(key) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('Error reading from storage:', error);
                return null;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error writing to storage:', error);
                if (error.name === 'QuotaExceededError') {
                    alert('Storage quota exceeded. Please delete some jobs.');
                }
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from storage:', error);
                return false;
            }
        }
    };

    // ===================================
    // DATA MODEL & UTILITIES
    // ===================================

    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function validateURL(url) {
        if (!url) return true; // URL is optional
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    function createJob(data) {
        return {
            id: generateUUID(),
            company: sanitizeInput(data.company),
            role: sanitizeInput(data.role),
            jobType: data.jobType,
            location: data.location,
            applicationDate: data.applicationDate,
            status: data.status,
            jobLink: data.jobLink || '',
            notes: sanitizeInput(data.notes) || '',
            createdAt: new Date().toISOString()
        };
    }

    // ===================================
    // APPLICATION STATE
    // ===================================

    const AppState = {
        jobs: [],
        filteredJobs: [],
        currentEditingJobId: null,
        deletedJob: null,
        deleteTimeout: null,
        filters: {
            search: '',
            status: 'all',
            jobType: 'all',
            location: 'all',
            sort: 'newest'
        },
        charts: {
            statusChart: null,
            trendChart: null
        }
    };

    // ===================================
    // CRUD OPERATIONS
    // ===================================

    function loadJobs() {
        const jobs = Storage.get(Storage.KEYS.JOBS);
        AppState.jobs = Array.isArray(jobs) ? jobs : [];
        applyFilters();
    }

    function saveJobs() {
        return Storage.set(Storage.KEYS.JOBS, AppState.jobs);
    }

    function addJob(jobData) {
        const job = createJob(jobData);
        AppState.jobs.unshift(job); // Add to beginning
        if (saveJobs()) {
            applyFilters();
            return job;
        }
        return null;
    }

    function updateJob(jobId, jobData) {
        const index = AppState.jobs.findIndex(job => job.id === jobId);
        if (index !== -1) {
            AppState.jobs[index] = {
                ...AppState.jobs[index],
                company: sanitizeInput(jobData.company),
                role: sanitizeInput(jobData.role),
                jobType: jobData.jobType,
                location: jobData.location,
                applicationDate: jobData.applicationDate,
                status: jobData.status,
                jobLink: jobData.jobLink || '',
                notes: sanitizeInput(jobData.notes) || ''
            };
            if (saveJobs()) {
                applyFilters();
                return true;
            }
        }
        return false;
    }

    function deleteJob(jobId) {
        const index = AppState.jobs.findIndex(job => job.id === jobId);
        if (index !== -1) {
            const deletedJob = AppState.jobs.splice(index, 1)[0];
            if (saveJobs()) {
                applyFilters();
                return deletedJob;
            } else {
                // Restore if save failed
                AppState.jobs.splice(index, 0, deletedJob);
            }
        }
        return null;
    }

    function getJobById(jobId) {
        return AppState.jobs.find(job => job.id === jobId);
    }

    // ===================================
    // SEARCH & FILTER
    // ===================================

    function applyFilters() {
        let filtered = [...AppState.jobs];
        const { search, status, jobType, location, sort } = AppState.filters;

        // Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(job => 
                job.company.toLowerCase().includes(searchLower) ||
                job.role.toLowerCase().includes(searchLower)
            );
        }

        // Status filter
        if (status !== 'all') {
            filtered = filtered.filter(job => job.status === status);
        }

        // Job type filter
        if (jobType !== 'all') {
            filtered = filtered.filter(job => job.jobType === jobType);
        }

        // Location filter
        if (location !== 'all') {
            filtered = filtered.filter(job => job.location === location);
        }

        // Sort
        filtered.sort((a, b) => {
            const dateA = new Date(a.applicationDate);
            const dateB = new Date(b.applicationDate);
            return sort === 'newest' ? dateB - dateA : dateA - dateB;
        });

        AppState.filteredJobs = filtered;
        renderJobsList();
        renderAnalytics();
    }

    // ===================================
    // ANALYTICS ENGINE
    // ===================================

    function calculateAnalytics() {
        const total = AppState.jobs.length;
        const statusBreakdown = {
            Applied: 0,
            Interview: 0,
            Offer: 0,
            Rejected: 0,
            Ghosted: 0
        };

        AppState.jobs.forEach(job => {
            if (statusBreakdown.hasOwnProperty(job.status)) {
                statusBreakdown[job.status]++;
            }
        });

        return { total, statusBreakdown };
    }

    function calculateTrend() {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        // Group by date
        const dateMap = {};
        AppState.jobs.forEach(job => {
            const jobDate = new Date(job.applicationDate);
            if (jobDate >= last30Days) {
                const dateKey = jobDate.toISOString().split('T')[0];
                dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
            }
        });

        // Create array of last 30 days
        const labels = [];
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            data.push(dateMap[dateKey] || 0);
        }

        return { labels, data };
    }

    // ===================================
    // UI RENDERING
    // ===================================

    function renderAnalytics() {
        const { total, statusBreakdown } = calculateAnalytics();

        // Update stat cards
        document.getElementById('total-applications').textContent = total;
        document.getElementById('applied-count').textContent = statusBreakdown.Applied;
        document.getElementById('interview-count').textContent = statusBreakdown.Interview;
        document.getElementById('offer-count').textContent = statusBreakdown.Offer;
        document.getElementById('rejected-count').textContent = statusBreakdown.Rejected;
        document.getElementById('ghosted-count').textContent = statusBreakdown.Ghosted;

        renderCharts();
    }

    function renderCharts() {
        const { statusBreakdown } = calculateAnalytics();
        const trend = calculateTrend();

        // Status Pie Chart
        const statusCtx = document.getElementById('status-chart');
        if (AppState.charts.statusChart) {
            AppState.charts.statusChart.destroy();
        }

        const hasData = Object.values(statusBreakdown).some(val => val > 0);
        
        AppState.charts.statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'],
                datasets: [{
                    data: hasData ? Object.values(statusBreakdown) : [1, 1, 1, 1, 1],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(107, 114, 128, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--color-text-primary').trim(),
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        enabled: hasData
                    }
                }
            }
        });

        // Trend Line Chart
        const trendCtx = document.getElementById('trend-chart');
        if (AppState.charts.trendChart) {
            AppState.charts.trendChart.destroy();
        }

        AppState.charts.trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: trend.labels,
                datasets: [{
                    label: 'Applications',
                    data: trend.data,
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--color-text-secondary').trim()
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--color-border').trim()
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--color-text-secondary').trim()
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    function renderJobCard(job) {
        return `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-card-header">
                    <div class="job-card-title">
                        <h3 class="job-company">${job.company}</h3>
                        <p class="job-role">${job.role}</p>
                    </div>
                    <div class="job-card-actions">
                        <button class="btn-icon-small edit-job-btn" data-job-id="${job.id}" aria-label="Edit job" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon-small delete-job-btn" data-job-id="${job.id}" aria-label="Delete job" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="job-card-meta">
                    <span class="job-badge badge-status ${job.status}">${job.status}</span>
                    <span class="job-badge badge-type">${job.jobType}</span>
                    <span class="job-badge badge-location">📍 ${job.location}</span>
                </div>
                <div class="job-card-info">
                    <strong>Applied:</strong> ${formatDate(job.applicationDate)}
                </div>
                ${job.jobLink ? `<a href="${job.jobLink}" target="_blank" rel="noopener noreferrer" class="job-card-link">🔗 View Job Posting</a>` : ''}
                ${job.notes ? `<div class="job-card-notes"><strong>Notes:</strong> ${job.notes}</div>` : ''}
            </div>
        `;
    }

    function renderJobsList() {
        const container = document.getElementById('jobs-container');
        const emptyState = document.getElementById('empty-state');
        const resultsCount = document.getElementById('results-count');

        resultsCount.textContent = `${AppState.filteredJobs.length} job${AppState.filteredJobs.length !== 1 ? 's' : ''}`;

        if (AppState.filteredJobs.length === 0) {
            container.innerHTML = '';
            emptyState.classList.add('visible');
        } else {
            emptyState.classList.remove('visible');
            container.innerHTML = AppState.filteredJobs.map(job => renderJobCard(job)).join('');
            attachJobCardListeners();
        }
    }

    function attachJobCardListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-job-btn').forEach(btn => {
            btn.addEventListener('click', handleEditJob);
        });

        // Delete buttons
        document.querySelectorAll('.delete-job-btn').forEach(btn => {
            btn.addEventListener('click', handleDeleteJobClick);
        });
    }

    // ===================================
    // MODAL MANAGEMENT
    // ===================================

    function showJobModal(jobId = null) {
        const modal = document.getElementById('job-modal');
        const modalTitle = document.getElementById('modal-title');
        const submitBtnText = document.getElementById('submit-btn-text');
        const form = document.getElementById('job-form');

        AppState.currentEditingJobId = jobId;

        if (jobId) {
            const job = getJobById(jobId);
            if (job) {
                modalTitle.textContent = 'Edit Job';
                submitBtnText.textContent = 'Update Job';
                
                // Populate form
                document.getElementById('company-name').value = job.company;
                document.getElementById('role').value = job.role;
                document.getElementById('job-type').value = job.jobType;
                document.getElementById('location').value = job.location;
                document.getElementById('application-date').value = job.applicationDate;
                document.getElementById('status').value = job.status;
                document.getElementById('job-link').value = job.jobLink;
                document.getElementById('notes').value = job.notes;
            }
        } else {
            modalTitle.textContent = 'Add New Job';
            submitBtnText.textContent = 'Add Job';
            form.reset();
            // Set default date to today
            document.getElementById('application-date').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.add('active');
        document.getElementById('company-name').focus();
    }

    function hideJobModal() {
        const modal = document.getElementById('job-modal');
        modal.classList.remove('active');
        document.getElementById('job-form').reset();
        AppState.currentEditingJobId = null;
    }

    function showDeleteModal(jobId) {
        const modal = document.getElementById('delete-modal');
        modal.classList.add('active');
        modal.dataset.jobId = jobId;
    }

    function hideDeleteModal() {
        const modal = document.getElementById('delete-modal');
        modal.classList.remove('active');
        delete modal.dataset.jobId;
    }

    // ===================================
    // TOAST NOTIFICATIONS
    // ===================================

    function showToast(message, actionText = null, actionCallback = null, duration = 5000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';

        const messageSpan = document.createElement('span');
        messageSpan.className = 'toast-message';
        messageSpan.textContent = message;
        toast.appendChild(messageSpan);

        if (actionText && actionCallback) {
            const actionBtn = document.createElement('button');
            actionBtn.className = 'toast-action';
            actionBtn.textContent = actionText;
            actionBtn.addEventListener('click', () => {
                actionCallback();
                toast.remove();
            });
            toast.appendChild(actionBtn);
        }

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    // ===================================
    // EVENT HANDLERS
    // ===================================

    function handleAddJob() {
        showJobModal();
    }

    function handleEditJob(e) {
        const jobId = e.currentTarget.dataset.jobId;
        showJobModal(jobId);
    }

    function handleDeleteJobClick(e) {
        const jobId = e.currentTarget.dataset.jobId;
        showDeleteModal(jobId);
    }

    function handleConfirmDelete() {
        const modal = document.getElementById('delete-modal');
        const jobId = modal.dataset.jobId;
        
        if (jobId) {
            const deletedJob = deleteJob(jobId);
            if (deletedJob) {
                AppState.deletedJob = deletedJob;
                
                // Clear any existing timeout
                if (AppState.deleteTimeout) {
                    clearTimeout(AppState.deleteTimeout);
                }

                // Show undo toast
                showToast(
                    `Deleted "${deletedJob.company}" application`,
                    'Undo',
                    handleUndoDelete,
                    5000
                );

                // Set timeout to clear deleted job
                AppState.deleteTimeout = setTimeout(() => {
                    AppState.deletedJob = null;
                }, 5000);
            }
        }
        
        hideDeleteModal();
    }

    function handleUndoDelete() {
        if (AppState.deletedJob) {
            AppState.jobs.unshift(AppState.deletedJob);
            saveJobs();
            applyFilters();
            
            if (AppState.deleteTimeout) {
                clearTimeout(AppState.deleteTimeout);
            }
            
            showToast(`Restored "${AppState.deletedJob.company}" application`, null, null, 2000);
            AppState.deletedJob = null;
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            company: document.getElementById('company-name').value.trim(),
            role: document.getElementById('role').value.trim(),
            jobType: document.getElementById('job-type').value,
            location: document.getElementById('location').value,
            applicationDate: document.getElementById('application-date').value,
            status: document.getElementById('status').value,
            jobLink: document.getElementById('job-link').value.trim(),
            notes: document.getElementById('notes').value.trim()
        };

        // Validation
        if (!formData.company || !formData.role || !formData.jobType || 
            !formData.location || !formData.applicationDate || !formData.status) {
            alert('Please fill in all required fields');
            return;
        }

        if (formData.jobLink && !validateURL(formData.jobLink)) {
            alert('Please enter a valid URL for the job link');
            return;
        }

        if (AppState.currentEditingJobId) {
            // Update existing job
            if (updateJob(AppState.currentEditingJobId, formData)) {
                showToast('Job updated successfully', null, null, 2000);
                hideJobModal();
            }
        } else {
            // Add new job
            const job = addJob(formData);
            if (job) {
                showToast('Job added successfully', null, null, 2000);
                hideJobModal();
            }
        }
    }

    function handleSearch(e) {
        AppState.filters.search = e.target.value.trim();
        applyFilters();
    }

    function handleStatusFilter(e) {
        AppState.filters.status = e.target.value;
        applyFilters();
    }

    function handleJobTypeFilter(e) {
        AppState.filters.jobType = e.target.value;
        applyFilters();
    }

    function handleLocationFilter(e) {
        AppState.filters.location = e.target.value;
        applyFilters();
    }

    function handleSort(e) {
        AppState.filters.sort = e.target.value;
        applyFilters();
    }

    // ===================================
    // THEME MANAGEMENT
    // ===================================

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        Storage.set(Storage.KEYS.THEME, newTheme);
        
        // Update theme icon
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';

        // Re-render charts with new colors
        renderCharts();
    }

    function loadTheme() {
        const savedTheme = Storage.get(Storage.KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    // ===================================
    // CSV IMPORT/EXPORT
    // ===================================

    function exportToCSV() {
        if (AppState.jobs.length === 0) {
            alert('No jobs to export');
            return;
        }

        const headers = ['Company', 'Role', 'Job Type', 'Location', 'Application Date', 'Status', 'Job Link', 'Notes'];
        const rows = AppState.jobs.map(job => [
            job.company,
            job.role,
            job.jobType,
            job.location,
            job.applicationDate,
            job.status,
            job.jobLink,
            job.notes
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `job-applications-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Jobs exported successfully', null, null, 2000);
    }

    function importFromCSV(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                
                if (lines.length < 2) {
                    alert('CSV file is empty or invalid');
                    return;
                }

                const imported = [];
                // Skip header row
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Parse CSV line (handle quoted fields)
                    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
                    if (!matches || matches.length < 6) continue;

                    const [company, role, jobType, location, applicationDate, status, jobLink = '', notes = ''] = 
                        matches.map(field => field.replace(/^"|"$/g, ''));

                    const jobData = {
                        company,
                        role,
                        jobType,
                        location,
                        applicationDate,
                        status,
                        jobLink,
                        notes
                    };

                    const job = addJob(jobData);
                    if (job) imported.push(job);
                }

                if (imported.length > 0) {
                    showToast(`Imported ${imported.length} job${imported.length !== 1 ? 's' : ''}`, null, null, 3000);
                } else {
                    alert('No valid jobs found in CSV file');
                }
            } catch (error) {
                console.error('Error importing CSV:', error);
                alert('Error importing CSV file. Please check the format.');
            }
        };

        reader.readAsText(file);
    }

    // ===================================
    // ONBOARDING
    // ===================================

    function checkOnboarding() {
        const completed = Storage.get(Storage.KEYS.ONBOARDING);
        if (!completed && AppState.jobs.length === 0) {
            setTimeout(() => {
                const tooltip = document.getElementById('onboarding-tooltip');
                tooltip.classList.add('visible');
            }, 1000);
        }
    }

    function completeOnboarding() {
        const tooltip = document.getElementById('onboarding-tooltip');
        tooltip.classList.remove('visible');
        Storage.set(Storage.KEYS.ONBOARDING, true);
    }

    // ===================================
    // KEYBOARD SHORTCUTS
    // ===================================

    function handleKeyboardShortcuts(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            if (document.getElementById('job-modal').classList.contains('active')) {
                hideJobModal();
            }
            if (document.getElementById('delete-modal').classList.contains('active')) {
                hideDeleteModal();
            }
        }

        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }

        // Ctrl/Cmd + N to add new job
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            handleAddJob();
        }
    }

    // ===================================
    // DEBOUNCE UTILITY
    // ===================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ===================================
    // EVENT LISTENERS SETUP
    // ===================================

    function setupEventListeners() {
        // Add job button
        document.getElementById('add-job-btn').addEventListener('click', handleAddJob);

        // Modal controls
        document.getElementById('close-modal-btn').addEventListener('click', hideJobModal);
        document.getElementById('modal-backdrop').addEventListener('click', hideJobModal);
        document.getElementById('cancel-btn').addEventListener('click', hideJobModal);

        // Delete modal controls
        document.getElementById('delete-modal-backdrop').addEventListener('click', hideDeleteModal);
        document.getElementById('cancel-delete-btn').addEventListener('click', hideDeleteModal);
        document.getElementById('confirm-delete-btn').addEventListener('click', handleConfirmDelete);

        // Form submit
        document.getElementById('job-form').addEventListener('submit', handleFormSubmit);

        // Search and filters
        document.getElementById('search-input').addEventListener('input', debounce(handleSearch, 300));
        document.getElementById('status-filter').addEventListener('change', handleStatusFilter);
        document.getElementById('job-type-filter').addEventListener('change', handleJobTypeFilter);
        document.getElementById('location-filter').addEventListener('change', handleLocationFilter);
        document.getElementById('sort-select').addEventListener('change', handleSort);

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        // CSV export/import
        document.getElementById('export-csv-btn').addEventListener('click', exportToCSV);
        document.getElementById('import-csv-btn').addEventListener('click', () => {
            document.getElementById('csv-file-input').click();
        });
        document.getElementById('csv-file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importFromCSV(file);
                e.target.value = ''; // Reset input
            }
        });

        // Onboarding
        document.getElementById('got-it-btn').addEventListener('click', completeOnboarding);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    // ===================================
    // INITIALIZATION
    // ===================================

    function init() {
        loadTheme();
        loadJobs();
        setupEventListeners();
        renderAnalytics();
        renderJobsList();
        checkOnboarding();
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
