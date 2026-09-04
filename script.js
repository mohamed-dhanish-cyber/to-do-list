document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const launchBtn = document.getElementById('launch-btn');
    const taskList = document.getElementById('task-list');
    const statsGraph = document.getElementById('stats-graph');
    const statsText = document.getElementById('stats-text');
    const rewardSection = document.getElementById('reward-section');

    // Load tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('antiGravityTasks')) || [];
    let currentPercentage = 0;
    let animationFrameId = null;

    // Initialize list
    renderTasks();
    updateStats();

    // Event Listeners
    launchBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        updateStats();
        
        // Render specifically the new task to get the fly-in animation
        const taskEl = createTaskElement(newTask);
        taskList.appendChild(taskEl);
        
        taskInput.value = '';
        taskInput.focus();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const taskEl = createTaskElement(task);
            taskList.appendChild(taskEl);
        });
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        // Apply a random animation delay so they bob independently
        const delay = (Math.random() * 2).toFixed(2);
        li.style.animationDelay = `${delay}s, 0s`; // float delay, flyIn delay

        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn btn-complete';
        completeBtn.innerHTML = task.completed ? '&#8634;' : '&#10003;'; // Undo or Checkmark
        completeBtn.title = task.completed ? 'Restore Weight' : 'Mark Complete';
        completeBtn.addEventListener('click', () => toggleComplete(task.id, li));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-delete';
        deleteBtn.innerHTML = '&#10005;'; // X mark
        deleteBtn.title = 'Destroy';
        deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

        actionsDiv.appendChild(completeBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(textSpan);
        li.appendChild(actionsDiv);

        return li;
    }

    function toggleComplete(id, element) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            updateStats();
            
            // Toggle appearance
            if (task.completed) {
                element.classList.add('completed');
                element.querySelector('.btn-complete').innerHTML = '&#8634;'; // undo symbol
            } else {
                element.classList.remove('completed');
                element.querySelector('.btn-complete').innerHTML = '&#10003;'; // check mark
            }
        }
    }

    function deleteTask(id, element) {
        // Trigger anti-gravity fly-away effect
        element.classList.add('fly-away');

        // Wait for animation to finish before actually removing from DOM and storage
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            updateStats();
            element.remove();
        }, 1500); // matches the 1.5s animation duration in CSS
    }

    function updateStats() {
        if (!statsGraph) return;
        const ctx = statsGraph.getContext('2d');
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const targetPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        if (statsText) {
            statsText.textContent = `${targetPercentage}% Completed`;
        }

        if (rewardSection) {
            if (targetPercentage === 100 && total > 0) {
                rewardSection.classList.remove('hidden');
            } else {
                rewardSection.classList.add('hidden');
            }
        }

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        const animate = () => {
            const diff = targetPercentage - currentPercentage;
            
            // Ease towards target
            if (Math.abs(diff) > 0.1) {
                currentPercentage += diff * 0.1;
                animationFrameId = requestAnimationFrame(animate);
            } else {
                currentPercentage = targetPercentage;
            }

            drawGraph(currentPercentage);
        };

        animate();

        function drawGraph(percentage) {
            const cx = statsGraph.width / 2;
            const cy = statsGraph.height / 2;
            const radius = cx - 15;
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (percentage / 100) * (2 * Math.PI);

            ctx.clearRect(0, 0, statsGraph.width, statsGraph.height);

            // Draw background circle
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            ctx.lineWidth = 15;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.stroke();

            // Draw progress circle
            if (percentage > 0) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius, startAngle, endAngle);
                ctx.lineWidth = 15;
                ctx.strokeStyle = '#00d2ff'; // accent-blue
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }
    }

    function saveTasks() {
        localStorage.setItem('antiGravityTasks', JSON.stringify(tasks));
    }
});
