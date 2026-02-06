// API Configuration
const API_URL = 'http://localhost:5000/api/tasks';

// State
let currentFilter = 'all';
let editingTaskId = null;
let currentUser = null;

// DOM Elements
const tasksList = document.getElementById('tasksList');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const newTaskBtn = document.getElementById('newTaskBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const submitBtnText = document.getElementById('submitBtnText');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupTheme();
    checkAuth();

    const urlParams = new URLSearchParams(window.location.search);
    const addTaskParam = urlParams.get('addTask');

    const isDashboard = window.location.pathname.endsWith('dashboard.html');

    // Check if we are on the dashboard
    if (isDashboard) {
        if (!currentUser) {
            window.location.href = 'login.html'; // Protect Dashboard
        } else {
            loadTasks();
            setupEventListeners();

            // Auto-open modal if requested via URL
            if (addTaskParam === 'true') {
                setTimeout(openNewTaskModal, 500); // Small delay to ensure everything is ready
            }
        }
    } else {
        // Landing Page or other pages
        // Only setup listeners for elements that exist on this page
        if (newTaskBtn) newTaskBtn.addEventListener('click', openNewTaskModal);
    }
});

// Event Listeners
function setupEventListeners() {
    if (newTaskBtn) newTaskBtn.addEventListener('click', openNewTaskModal);
    if (closeModal) closeModal.addEventListener('click', closeTaskModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeTaskModal);
    if (taskForm) taskForm.addEventListener('submit', handleSubmit);
    const quickForm = document.getElementById('newTaskQuickForm');
    if (quickForm) {
        quickForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('quickTaskTitle');
            const title = titleInput.value.trim();
            if (!title) return;
            try {
                await createTask({ title, description: '', status: 'pending' });
                titleInput.value = '';
                await loadTasks();
            } catch (err) {}
        });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.filter;
                renderTasks();
            });
        });
    }

    // Close modal on outside click
    if (taskModal) {
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) {
                closeTaskModal();
            }
        });
    }
}

// API Functions
async function fetchTasks() {
    if (!currentUser) return [];
    try {
        const response = await fetch(`${API_URL}?userId=${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showError('Failed to load tasks. Make sure the backend server is running on port 5000.');
        return [];
    }
}

async function createTask(taskData) {
    if (!currentUser) return;
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...taskData, userId: currentUser.id })
        });
        if (!response.ok) throw new Error('Failed to create task');
        return await response.json();
    } catch (error) {
        console.error('Error creating task:', error);
        showError('Failed to create task');
        throw error;
    }
}

async function updateTask(id, taskData) {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...taskData, userId: currentUser.id })
        });
        if (!response.ok) throw new Error('Failed to update task');
        return await response.json();
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task');
        throw error;
    }
}

async function deleteTask(id) {
    if (!currentUser) return;
    try {
        const response = await fetch(`${API_URL}/${id}?userId=${currentUser.id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete task');
        return await response.json();
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('Failed to delete task');
        throw error;
    }
}

// Load and Render Tasks
async function loadTasks() {
    if (!tasksList) return; // Guard clause
    showLoading();
    const tasks = await fetchTasks();
    window.allTasks = tasks;
    renderTasks();
    updateStats();
}

function renderTasks() {
    if (!tasksList) return;
    const tasks = window.allTasks || [];

    // Filter tasks
    const filteredTasks = currentFilter === 'all'
        ? tasks
        : tasks.filter(task => task.status === currentFilter);

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray-400);">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin: 0 auto 1rem; opacity: 0.5;">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/>
                    <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>No tasks found. Create your first task!</p>
            </div>
        `;
        return;
    }

    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-card" data-task-id="${task.id}">
            <div class="task-content">
                <h4>${escapeHtml(task.title)}</h4>
                <p>${escapeHtml(task.description || 'No description')}</p>
            </div>
            <div class="task-meta">
                <span class="task-status-badge ${task.status}">${task.status.replace('-', ' ')}</span>
                <div class="task-actions">
                    <button class="task-btn" onclick="editTask(${task.id})" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="task-btn" onclick="confirmDelete(${task.id})" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const tasks = window.allTasks || [];
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const completed = tasks.filter(t => t.status === 'completed').length;

    const pCount = document.getElementById('pendingCount');
    const prCount = document.getElementById('progressCount');
    const cCount = document.getElementById('completedCount');

    if (pCount) pCount.textContent = pending;
    if (prCount) prCount.textContent = inProgress;
    if (cCount) cCount.textContent = completed;
}

function showLoading() {
    if (tasksList) {
        tasksList.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading tasks...</p>
            </div>
        `;
    }
}

function showError(message) {
    if (tasksList) {
        tasksList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray-400);">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="margin: 0 auto 1rem; color: #f87171;">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke-width="2" stroke-linecap="round"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>${message}</p>
                <button class="btn-primary" onclick="loadTasks()" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    }
}

// Modal Functions
function openNewTaskModal() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // If we are on the landing page, redirect to dashboard to create task
    if (!window.location.pathname.endsWith('dashboard.html')) {
        window.location.href = 'dashboard.html?addTask=true';
        return;
    }

    editingTaskId = null;
    modalTitle.textContent = 'New Task';
    submitBtnText.textContent = 'Create Task';
    taskForm.reset();
    taskModal.classList.add('active');
}

function openEditTaskModal(task) {
    editingTaskId = task.id;
    modalTitle.textContent = 'Edit Task';
    submitBtnText.textContent = 'Update Task';

    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskStatus').value = task.status;

    taskModal.classList.add('active');
}

function closeTaskModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
    editingTaskId = null;
}

// Form Submit
async function handleSubmit(e) {
    e.preventDefault();

    const taskData = {
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        status: document.getElementById('taskStatus').value
    };

    if (!taskData.title) {
        alert('Please enter a task title');
        return;
    }

    try {
        if (editingTaskId) {
            await updateTask(editingTaskId, taskData);
        } else {
            await createTask(taskData);
        }

        closeTaskModal();
        await loadTasks();
    } catch (error) {
        // Error already handled in API functions
    }
}

// Task Actions
async function editTask(id) {
    const task = window.allTasks.find(t => t.id === id);
    if (task) {
        openEditTaskModal(task);
    }
}

async function confirmDelete(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        await deleteTask(id);
        await loadTasks();
    }
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Smooth scroll for nav links
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        // Only prevent default if it's an anchor on this page
        if (link.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Update active state
                document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
});

// Theme Management
function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Check saved preference
    const savedTheme = localStorage.getItem('theme');

    // Set initial state based on saved preference
    // If 'light', add class and show Sun
    // If 'dark' (or null), ensure no class and show Moon
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
    } else {
        document.body.classList.remove('light-mode');
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            // Update icons
            if (isLight) {
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
            } else {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
            }
        });
    }
}

// Auth Management
function checkAuth() {
    currentUser = JSON.parse(localStorage.getItem('user'));
    const authLinks = document.getElementById('authLinks');
    const userMenu = document.getElementById('userMenu');
    const welcomeMsg = document.getElementById('welcomeMsg');
    const logoutBtn = document.getElementById('logoutBtn');
    const userAvatar = document.getElementById('userAvatar');
    const dashboardLink = document.getElementById('dashboardLink');

    if (currentUser) {
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            welcomeMsg.textContent = `Welcome, ${currentUser.name.split(' ')[0]}`;
            if (userAvatar) userAvatar.textContent = getEmojiAvatar(currentUser.name);
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('user');
                window.location.href = 'index.html'; // Redirect to Landing on Logout
            });
        }
        if (dashboardLink) dashboardLink.setAttribute('href', 'dashboard.html');
    } else {
        if (authLinks) authLinks.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (dashboardLink) dashboardLink.setAttribute('href', 'login.html');
    }
}

// Simple emoji avatar generator based on name
function getEmojiAvatar(name) {
    const emojis = ['😎', '🦄', '🐯', '🐼', '🦊', '🐨', '🐸', '🐙', '🐳', '🐝', '🔥', '🌟', '💎', '🚀', '🎯', '🎩'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % emojis.length;
    return emojis[index];
}
