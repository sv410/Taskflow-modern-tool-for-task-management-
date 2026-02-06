// Demo Task Management
const demoTasks = [
    {
        id: 1,
        title: 'Design API endpoints',
        description: 'Create RESTful API structure',
        status: 'completed'
    },
    {
        id: 2,
        title: 'Implement backend logic',
        description: 'Build Express.js server with CRUD operations',
        status: 'in-progress'
    },
    {
        id: 3,
        title: 'Create React frontend',
        description: 'Build responsive UI components',
        status: 'pending'
    }
];

let taskIdCounter = 4;

// Render tasks
function renderTasks() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    if (demoTasks.length === 0) {
        taskList.innerHTML = '<p style="text-align: center; color: var(--gray-400); padding: 2rem;">No tasks yet. Click "Add Task" to create one!</p>';
        return;
    }
    
    demoTasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-info">
                <h4>${task.title}</h4>
                <p>${task.description}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="task-status ${task.status}">${task.status.replace('-', ' ')}</span>
                <div class="task-actions">
                    <button onclick="cycleStatus(${task.id})" title="Change status">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="23 4 23 10 17 10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button onclick="deleteTask(${task.id})" title="Delete task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
}

// Add task
function addTask() {
    const title = prompt('Enter task title:');
    if (!title) return;
    
    const description = prompt('Enter task description:');
    
    const newTask = {
        id: taskIdCounter++,
        title: title,
        description: description || 'No description',
        status: 'pending'
    };
    
    demoTasks.push(newTask);
    renderTasks();
}

// Cycle task status
function cycleStatus(taskId) {
    const task = demoTasks.find(t => t.id === taskId);
    if (!task) return;
    
    const statuses = ['pending', 'in-progress', 'completed'];
    const currentIndex = statuses.indexOf(task.status);
    task.status = statuses[(currentIndex + 1) % statuses.length];
    
    renderTasks();
}

// Delete task
function deleteTask(taskId) {
    const index = demoTasks.findIndex(t => t.id === taskId);
    if (index > -1) {
        demoTasks.splice(index, 1);
        renderTasks();
    }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
    });
}

// Add task button event
const addTaskBtn = document.getElementById('addTaskBtn');
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', addTask);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    
    // Add scroll effect to navbar
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(17, 24, 39, 0.95)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(17, 24, 39, 0.8)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
});
