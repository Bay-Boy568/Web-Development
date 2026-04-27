// To-Do List functionality
const taskInput = document.getElementById('task-input');
const taskTime = document.getElementById('task-time');
const taskDate = document.getElementById('task-date');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const totalTime = document.getElementById('total-time');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function formatTime(minutes) {
    if (minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let str = '';
    if (hours > 0) {
        str += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (mins > 0) {
        if (str) str += ' ';
        str += `${mins} min`;
    }
    return str;
}

function renderTasks() {
    taskList.innerHTML = '';
    let total = 0;
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        const est = task.estimatedTime || 0;
        const timeStr = formatTime(est);
        const dueDate = task.dueDate ? ` - Due: ${new Date(task.dueDate).toLocaleDateString()}` : '';
        li.textContent = `${task.text} (${timeStr})${dueDate}`;
        total += est;
        if (task.completed) {
            li.classList.add('completed');
        }
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
            renderCalendar();
        };
        li.appendChild(deleteBtn);
        li.onclick = () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        };
        taskList.appendChild(li);
    });
    const totalTimeStr = formatTime(total);
    totalTime.textContent = `Total estimated time: ${totalTimeStr}`;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

addTaskBtn.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    const estTime = parseInt(taskTime.value) || 0;
    const dueDate = taskDate.value || null;
    if (taskText) {
        tasks.push({ text: taskText, completed: false, estimatedTime: estTime, dueDate: dueDate });
        saveTasks();
        renderTasks();
        renderCalendar();
        taskInput.value = '';
        taskTime.value = '';
        taskDate.value = '';
    }
});

renderTasks();

// Pomodoro Timer functionality
const timerDisplay = document.getElementById('timer-display');
const timerInput = document.getElementById('timer-input');
const timerValue = document.getElementById('timer-value');
const startBtn = document.getElementById('start-timer-btn');
const pauseBtn = document.getElementById('pause-timer-btn');
const resetBtn = document.getElementById('reset-timer-btn');

let timer;
let timeLeft = timerInput.value * 60; // initial value
let initialTime = 0;
let isRunning = false;

timerValue.textContent = formatTime(parseInt(timerInput.value));

timerInput.addEventListener('input', () => {
    timerValue.textContent = formatTime(parseInt(timerInput.value));
    if (!isRunning) {
        timeLeft = timerInput.value * 60;
        updateDisplay();
    }
});

function updateDisplay() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        initialTime = timeLeft;
        timerInput.disabled = true;
        updateDisplay(); // Update immediately to show it's started
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft === 0) {
                clearInterval(timer);
                alert('Time\'s up!');
                isRunning = false;
                timerInput.disabled = false;
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    // Keep disabled until reset
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = timerInput.value * 60;
    initialTime = timeLeft;
    updateDisplay();
    isRunning = false;
    timerInput.disabled = false;
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

updateDisplay();

// Toggle sidebar
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const sidebar = document.querySelector('.sidebar');

toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    toggleSidebarBtn.textContent = sidebar.classList.contains('collapsed') ? 'Show Tasks' : 'Hide Tasks';
});

let currentAudioPlayer = new Audio();
const playMusicBtn = document.getElementById('play-music-btn');
const pauseMusicBtn = document.getElementById('pause-music-btn');
const trackSelector = document.getElementById('track-selector');

function playTrack(trackName) {
    if (trackName) {
        currentAudioPlayer.src = trackName;
        currentAudioPlayer.play();
    }
}

if (playMusicBtn) {
    playMusicBtn.addEventListener('click', () => {
        if (trackSelector) {
            const selectedTrack = trackSelector.value;
            playTrack(selectedTrack);
        } else {
            currentAudioPlayer.play();
        }
    });
}

if (pauseMusicBtn) {
    pauseMusicBtn.addEventListener('click', () => {
        currentAudioPlayer.pause();
    });
}

// Calendar functionality
const calendarTitle = document.getElementById('calendar-title');
const calendarDays = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const selectedDateDisplay = document.getElementById('selected-date-display');
const selectedDateTasks = document.getElementById('selected-date-tasks');

let currentDate = new Date();
let selectedDate = null;

function displaySelectedDateTasks(dateStr) {
    selectedDate = dateStr;
    const selectedTasksForDate = tasks.filter(task => task.dueDate === dateStr);
    const dateObj = new Date(dateStr);
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    selectedDateDisplay.textContent = formattedDate;
    selectedDateTasks.innerHTML = '';
    
    if (selectedTasksForDate.length === 0) {
        selectedDateTasks.innerHTML = '<p style="text-align: center; color: #888;">No tasks for this date</p>';
    } else {
        selectedTasksForDate.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'selected-date-task';
            
            const taskName = document.createElement('div');
            taskName.className = 'task-name';
            taskName.textContent = task.text;
            
            const taskDetails = document.createElement('div');
            taskDetails.className = 'task-details';
            const estTimeSpan = document.createElement('span');
            estTimeSpan.textContent = `Est: ${formatTime(task.estimatedTime || 0)}`;
            const dueDateSpan = document.createElement('span');
            dueDateSpan.textContent = `Due: ${new Date(task.dueDate).toLocaleDateString()}`;
            
            taskDetails.appendChild(estTimeSpan);
            taskDetails.appendChild(dueDateSpan);
            
            taskDiv.appendChild(taskName);
            taskDiv.appendChild(taskDetails);
            selectedDateTasks.appendChild(taskDiv);
        });
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update title
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    calendarTitle.textContent = `${monthNames[month]} ${year}`;
    
    // Clear previous calendar days
    calendarDays.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Helper function to check if a date has tasks
    function hasTaskOnDate(day, month, year) {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        return tasks.some(task => task.dueDate === dateStr);
    }
    
    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(dayDiv);
    }
    
    // Add current month's days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        const dayNum = document.createElement('span');
        dayNum.textContent = i;
        dayDiv.appendChild(dayNum);
        
        // Highlight today
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }
        
        // Add task indicator dot if there are tasks on this date
        if (hasTaskOnDate(i, month, year)) {
            const indicator = document.createElement('div');
            indicator.className = 'task-indicator';
            dayDiv.appendChild(indicator);
        }
        
        // Add click handler to show tasks for this date
        const dateStr = new Date(year, month, i).toISOString().split('T')[0];
        dayDiv.addEventListener('click', () => {
            displaySelectedDateTasks(dateStr);
        });
        
        calendarDays.appendChild(dayDiv);
    }
    
    // Add next month's days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows x 7 days
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day other-month';
        dayDiv.textContent = i;
        calendarDays.appendChild(dayDiv);
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

renderCalendar();