document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addTaskForm = document.getElementById('add-task-form');
    const taskList = document.getElementById('task-list');
    const statusFilter = document.getElementById('filter-status');
    const priorityFilter = document.getElementById('filter-priority');
    
    // Current task being edited
    let currentEditId = null;
    
    // Local storage key
    const STORAGE_KEY = 'task-manager-tasks';
    
    // Load tasks on page load
    loadTasks();
    
    // Event listeners
    addTaskForm.addEventListener('submit', handleFormSubmit);
    statusFilter.addEventListener('change', loadTasks);
    priorityFilter.addEventListener('change', loadTasks);
    
    // Event delegation for task actions
    taskList.addEventListener('click', function(e) {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        
        if (!taskItem) return;
        
        const taskId = taskItem.dataset.id;
        
        // Handle checkbox click
        if (target.classList.contains('task-checkbox')) {
            const status = target.checked ? 'completed' : 'pending';
            updateTaskStatus(taskId, status);
        }
        
        // Handle edit button click
        if (target.classList.contains('btn-edit')) {
            editTask(taskId);
        }
        
        // Handle delete button click
        if (target.classList.contains('btn-delete')) {
            deleteTask(taskId);
        }
    });
    
    // Function to get all tasks from local storage
    function getAllTasks() {
        const tasksJson = localStorage.getItem(STORAGE_KEY);
        return tasksJson ? JSON.parse(tasksJson) : [];
    }
    
    // Function to save all tasks to local storage
    function saveAllTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
    
    // Function to load and filter tasks
    function loadTasks() {
        const statusValue = statusFilter.value;
        const priorityValue = priorityFilter.value;
        
        let tasks = getAllTasks();
        
        // Apply filters
        if (statusValue !== 'all') {
            tasks = tasks.filter(task => task.status === statusValue);
        }
        
        if (priorityValue !== 'all') {
            tasks = tasks.filter(task => task.priority === priorityValue);
        }
        
        renderTasks(tasks);
    }
    
    // Function to render tasks in the DOM
    function renderTasks(tasks) {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<div class="no-tasks">No tasks found.</div>';
            return;
        }
        
        tasks.forEach(task => {
            const formattedDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';
            
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.status === 'completed' ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;
            taskElement.dataset.status = task.status;
            taskElement.dataset.priority = task.priority;
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''}>
                    <h3 class="task-title">${escapeHtml(task.title)}</h3>
                    <div class="task-actions">
                        <button class="btn-edit">Edit</button>
                        <button class="btn-delete">Delete</button>
                    </div>
                </div>
                <div class="task-body">
                    <p class="task-description">${escapeHtml(task.description) || 'No description'}</p>
                    <div class="task-meta">
                        <span class="task-due-date">${formattedDate}</span>
                        <span class="task-priority ${task.priority}">${capitalize(task.priority)}</span>
                    </div>
                </div>
            `;
            
            taskList.appendChild(taskElement);
        });
    }
    
    // Function to handle form submission (add or edit task)
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const dueDateInput = document.getElementById('due-date');
        const priorityInput = document.getElementById('priority');
        
        const taskData = {
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            due_date: dueDateInput.value || null,
            priority: priorityInput.value,
            status: 'pending' // Default status for new tasks
        };
        
        if (!taskData.title) {
            alert('Task title is required');
            return;
        }
        
        if (currentEditId) {
            // Update existing task
            updateTask(currentEditId, taskData);
        } else {
            // Add new task
            addTask(taskData);
        }
        
        // Reset form
        addTaskForm.reset();
        document.getElementById('task-submit-btn').textContent = 'Add Task';
        currentEditId = null;
    }
    
    // Function to add a new task
    function addTask(taskData) {
        const tasks = getAllTasks();
        
        // Generate a unique ID
        const newId = Date.now().toString();
        taskData.id = newId;
        
        // Add to tasks array
        tasks.push(taskData);
        
        // Save to local storage
        saveAllTasks(tasks);
        
        // Refresh the task list
        loadTasks();
    }
    
    // Function to update an existing task
    function updateTask(taskId, taskData) {
        const tasks = getAllTasks();
        
        // Find the task index
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) {
            alert('Task not found');
            return;
        }
        
        // Preserve the status
        taskData.status = tasks[taskIndex].status;
        
        // Update the task
        tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
        
        // Save to local storage
        saveAllTasks(tasks);
        
        // Refresh the task list
        loadTasks();
    }
    
    // Function to update task status
    function updateTaskStatus(taskId, status) {
        const tasks = getAllTasks();
        
        // Find the task
        const task = tasks.find(task => task.id === taskId);
        
        if (!task) {
            alert('Task not found');
            return;
        }
        
        // Update status
        task.status = status;
        
        // Save to local storage
        saveAllTasks(tasks);
        
        // Refresh the task list
        loadTasks();
    }
    
    // Function to populate form for editing
    function editTask(taskId) {
        const tasks = getAllTasks();
        
        // Find the task
        const task = tasks.find(task => task.id === taskId);
        
        if (!task) {
            alert('Task not found');
            return;
        }
        
        // Populate form
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('due-date').value = task.due_date ? task.due_date.split('T')[0] : '';
        document.getElementById('priority').value = task.priority;
        
        document.getElementById('task-submit-btn').textContent = 'Update Task';
        currentEditId = task.id;
        
        // Scroll to form
        document.querySelector('.task-form').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to delete a task
    function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        let tasks = getAllTasks();
        
        // Filter out the task to delete
        tasks = tasks.filter(task => task.id !== taskId);
        
        // Save to local storage
        saveAllTasks(tasks);
        
        // Refresh the task list
        loadTasks();
    }
    
    // Helper function to capitalize first letter
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});