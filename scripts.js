// DOM Elements
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-input");
const filterSelect = document.getElementById("filter-select");
const analyticsSection = document.getElementById("analytics");
const gamificationSection = document.getElementById("gamification");
const settingsButton = document.getElementById("settings-button");
const settingsModal = document.getElementById("settings-modal");
const closeSettingsButton = document.getElementById("close-settings");
const clearDataButton = document.getElementById("clear-data");
const statisticsButton = document.getElementById("statistics-button");
const statisticsModal = document.getElementById("statistics-modal");
const closeStatisticsButton = document.getElementById("close-statistics");
const saveSettingsButton = document.getElementById("save-settings");

// Task array to store tasks
let tasks = [];

// Gamification variables
let userBadges = [];
let streak = 0;
let lastCompletionDate = null;
let username = "";

const badges = [
  { name: "Beginner", tasks: 5, icon: "🥉" },
  { name: "Intermediate", tasks: 15, icon: "🥈" },
  { name: "Expert", tasks: 30, icon: "🥇" },
  { name: "Master", tasks: 50, icon: "👑" },
];

// Statistics object
let statistics = {
  tasksCompleted: 0,
  tasksCreated: 0,
  highestStreak: 0,
  completionRateByDay: {},
  completionRateByPriority: { low: 0, medium: 0, high: 0 },
};

// Pagination variables
const TASKS_PER_PAGE = 20;
let currentPage = 1;

// Function to get current date in YYYY-MM-DD format
function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

// Function to set the creation date to today when the form loads
function setInitialCreationDate() {
  document.getElementById("task-creation-date").value = getCurrentDate();
}

// Function to load data from localStorage
function loadData() {
  const storedData = JSON.parse(localStorage.getItem("todoAppData"));
  if (storedData) {
    tasks = storedData.tasks || [];
    userBadges = storedData.userBadges || [];
    streak = storedData.streak || 0;
    lastCompletionDate = storedData.lastCompletionDate
      ? new Date(storedData.lastCompletionDate)
      : null;
    statistics = storedData.statistics || {
      tasksCompleted: 0,
      tasksCreated: 0,
      highestStreak: 0,
      completionRateByDay: {},
      completionRateByPriority: { low: 0, medium: 0, high: 0 },
    };
    username = storedData.username || "";
  } else {
    clearData();
  }
}

// Function to save data to localStorage
function saveData() {
  const dataToStore = {
    tasks,
    userBadges,
    streak,
    lastCompletionDate,
    statistics,
    username,
  };
  localStorage.setItem("todoAppData", JSON.stringify(dataToStore));
}

// Function to clear all data
function clearData() {
  tasks = [];
  userBadges = [];
  streak = 0;
  lastCompletionDate = null;
  statistics = {
    tasksCompleted: 0,
    tasksCreated: 0,
    highestStreak: 0,
    completionRateByDay: {},
    completionRateByPriority: { low: 0, medium: 0, high: 0 },
  };
  username = "";
  saveData();
  renderTasks();
  updateGamificationDisplay();
}

// Function to add a new task
async function addTask(e) {
  e.preventDefault();
  showLoading();
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  const creationDate = document.getElementById("task-creation-date").value;
  const dueDate = document.getElementById("task-due-date").value;
  const priority = document.getElementById("task-priority").value;
  const tags = document
    .getElementById("task-tags")
    .value.split(",")
    .map((tag) => tag.trim());

  const newTask = {
    title,
    description,
    creationDate,
    dueDate,
    priority,
    tags,
    completed: false,
  };

  tasks.push(newTask);
  statistics.tasksCreated++;
  await saveData();
  updateGamificationDisplay();
  renderTasks();
  taskForm.reset();
  setInitialCreationDate();
  hideLoading();
}

// Function to edit a task
function editTask(index) {
  const task = tasks[index];
  document.getElementById("task-title").value = task.title;
  document.getElementById("task-description").value = task.description;
  document.getElementById("task-creation-date").value = task.creationDate;
  document.getElementById("task-due-date").value = task.dueDate;
  document.getElementById("task-priority").value = task.priority;
  document.getElementById("task-tags").value = task.tags.join(", ");

  tasks.splice(index, 1);

  const submitButton = document.querySelector(
    '#task-form button[type="submit"]'
  );
  submitButton.innerHTML = '<i class="fas fa-save"></i> Update Task';
  submitButton.onclick = async function (e) {
    e.preventDefault();
    showLoading();
    const updatedTask = {
      title: document.getElementById("task-title").value,
      description: document.getElementById("task-description").value,
      creationDate: document.getElementById("task-creation-date").value,
      dueDate: document.getElementById("task-due-date").value,
      priority: document.getElementById("task-priority").value,
      tags: document
        .getElementById("task-tags")
        .value.split(",")
        .map((tag) => tag.trim()),
      completed: false,
    };
    tasks.push(updatedTask);
    await saveData();
    renderTasks();
    taskForm.reset();
    setInitialCreationDate();
    submitButton.innerHTML = '<i class="fas fa-plus"></i> Add Task';
    submitButton.onclick = addTask;
    hideLoading();
  };
}

// Function to toggle task completion
async function toggleComplete(index) {
  const task = tasks[index];
  const wasCompleted = task.completed;
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;

  if (task.completed && !wasCompleted) {
    updateBadgesAndStreak();
    statistics.completionRateByPriority[task.priority]++;
    const color = getPriorityColor(task.priority);
    celebrateAchievement("task", color);
  } else if (!task.completed && wasCompleted) {
    statistics.tasksCompleted--;
    statistics.completionRateByPriority[task.priority]--;
  }

  await saveData();
  updateGamificationDisplay();
  renderTasks();
}

// Function to delete a task
async function deleteTask(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    if (tasks[index].completed) {
      statistics.tasksCompleted--;
      statistics.completionRateByPriority[tasks[index].priority]--;
      updateGamificationDisplay();
    }
    tasks.splice(index, 1);
    await saveData();
    updateGamificationDisplay();
    renderTasks();
  }
}

// Function to update badges and streak
async function updateBadgesAndStreak() {
  statistics.tasksCompleted++;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (lastCompletionDate) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastCompletionDate.getTime() === yesterday.getTime()) {
      streak++;
    } else if (lastCompletionDate.getTime() < yesterday.getTime()) {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  if (streak > statistics.highestStreak) {
    statistics.highestStreak = streak;
  }

  lastCompletionDate = today;

  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
  statistics.completionRateByDay[dayOfWeek] =
    (statistics.completionRateByDay[dayOfWeek] || 0) + 1;

  const newBadge = badges.find(
    (badge) => statistics.tasksCompleted === badge.tasks
  );
  if (newBadge) {
    userBadges.push(newBadge.name);
    const badgeColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary-color")
      .trim();
    celebrateAchievement("badge", badgeColor);
  }

  const taskColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary-color")
    .trim();
  celebrateAchievement("task", taskColor);

  await saveData();
  updateGamificationDisplay();
}

// Function to update gamification display
function updateGamificationDisplay() {
  const currentBadge =
    badges.filter((badge) => statistics.tasksCompleted >= badge.tasks).pop() ||
    badges[0];
  const nextBadge =
    badges.find((badge) => statistics.tasksCompleted < badge.tasks) ||
    badges[badges.length - 1];

  const completedTasks = statistics.tasksCompleted;
  const tasksToNextBadge = nextBadge.tasks - completedTasks;
  const progressPercentage =
    completedTasks > 0 ? (completedTasks / nextBadge.tasks) * 100 : 0;

  const greeting = username ? `${username}'s Progress` : "Your Progress";

  gamificationSection.innerHTML = `
    <h2><i class="fas fa-trophy"></i> ${greeting}</h2>
    <p><i class="fas fa-check-circle"></i> Completed Tasks: ${completedTasks}</p>
    <p><i class="fas fa-fire"></i> Current Streak: ${streak} day${
    streak !== 1 ? "s" : ""
  }</p>
    <p><i class="fas fa-medal"></i> Current Badge: ${currentBadge.icon} ${
    currentBadge.name
  }</p>
    
    <h3>Progress to Next Badge</h3>
    <div class="progress-bar">
      <div class="progress" style="width: ${progressPercentage}%"></div>
    </div>
    <p><i class="fas fa-award"></i> Next badge: ${nextBadge.icon} ${
    nextBadge.name
  } (${tasksToNextBadge} tasks to go)</p>
  `;
}

// Function to render tasks
function renderTasks(filteredTasks = tasks) {
  taskList.innerHTML = "";
  const start = (currentPage - 1) * TASKS_PER_PAGE;
  const end = start + TASKS_PER_PAGE;
  const tasksToRender = filteredTasks.slice(start, end);

  tasksToRender.forEach((task, index) => {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");
    taskItem.classList.add(`priority-${task.priority}`);
    if (task.completed) {
      taskItem.classList.add("completed");
    }
    taskItem.innerHTML = `
      <div>
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p><i class="fas fa-calendar-plus"></i> Created: ${
          task.creationDate || "Not set"
        }</p>
        <p><i class="far fa-calendar-alt"></i> Due: ${
          task.dueDate || "Not set"
        }</p>
        <p>${getPriorityIcon(task.priority)} Priority: ${task.priority}</p>
        <p><i class="fas fa-tags"></i> Tags: ${task.tags.join(", ")}</p>
      </div>
      <div>
        <button onclick="toggleComplete(${
          start + index
        })" aria-label="Toggle task completion">
          <i class="fas ${task.completed ? "fa-undo" : "fa-check"}"></i>
          ${task.completed ? "Undo Complete" : "Mark Complete"}
        </button>
        <button onclick="editTask(${start + index})" aria-label="Edit task">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button onclick="deleteTask(${start + index})" aria-label="Delete task">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
      </div>
    `;
    taskList.appendChild(taskItem);
  });

  if (end < filteredTasks.length) {
    const loadMoreBtn = document.createElement("button");
    loadMoreBtn.textContent = "Load More";
    loadMoreBtn.addEventListener("click", () => {
      currentPage++;
      renderTasks(filteredTasks);
    });
    taskList.appendChild(loadMoreBtn);
  }

  updateAnalytics();
}

// Function to get priority icon
function getPriorityIcon(priority) {
  switch (priority) {
    case "low":
      return '<i class="fas fa-arrow-down priority-icon" style="color: var(--priority-low);"></i>';
    case "medium":
      return '<i class="fas fa-equals priority-icon" style="color: var(--priority-medium);"></i>';
    case "high":
      return '<i class="fas fa-arrow-up priority-icon" style="color: var(--priority-high);"></i>';
    default:
      return "";
  }
}

// Function to get priority color
function getPriorityColor(priority) {
  switch (priority) {
    case "low":
      return getComputedStyle(document.documentElement)
        .getPropertyValue("--priority-low")
        .trim();
    case "medium":
      return getComputedStyle(document.documentElement)
        .getPropertyValue("--priority-medium")
        .trim();
    case "high":
      return getComputedStyle(document.documentElement)
        .getPropertyValue("--priority-high")
        .trim();
    default:
      return getComputedStyle(document.documentElement)
        .getPropertyValue("--text-color")
        .trim();
  }
}

// Function to toggle theme
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark-mode")
  );

  // Update the checkbox state
  document.getElementById("checkbox").checked =
    document.body.classList.contains("dark-mode");
}

// Function to search tasks
const debouncedSearch = debounce(() => {
  resetPagination();
  const searchTerm = searchInput.value.toLowerCase();
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
  );
  renderTasks(filteredTasks);
}, 300);

// Function to filter tasks
function filterTasks() {
  resetPagination();
  const filterValue = filterSelect.value;
  let filteredTasks = tasks;

  switch (filterValue) {
    case "completed":
      filteredTasks = tasks.filter((task) => task.completed);
      break;
    case "incomplete":
      filteredTasks = tasks.filter((task) => !task.completed);
      break;
    case "high-priority":
      filteredTasks = tasks.filter((task) => task.priority === "high");
      break;
    case "due-today":
      const today = new Date().toISOString().split("T")[0];
      filteredTasks = tasks.filter((task) => task.dueDate === today);
      break;
  }

  renderTasks(filteredTasks);
}

// Function to update analytics
function updateAnalytics() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionRate =
    totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

  analyticsSection.innerHTML = `
    <h2><i class="fas fa-chart-line"></i> Task Analytics</h2>
    <p><i class="fas fa-tasks"></i> Total Tasks: ${totalTasks}</p>
    <p><i class="fas fa-check-circle"></i> Completed Tasks: ${completedTasks}</p>
    <p><i class="fas fa-percentage"></i> Completion Rate: ${completionRate}%</p>
  `;
}

// Function to open settings modal
function openSettings() {
  settingsModal.style.display = "block";
  document.getElementById("username-input").value = username;
}

// Function to close settings modal
function closeSettings() {
  settingsModal.style.display = "none";
}

// Function to save settings
function saveSettings() {
  username = document.getElementById("username-input").value.trim();
  window.username = username;
  saveData();
  updateGamificationDisplay();
  closeSettings();
}

// Function to open statistics modal
function openStatistics() {
  statisticsModal.style.display = "block";
  updateStatisticsDisplay();
}

// Function to close statistics modal
function closeStatistics() {
  statisticsModal.style.display = "none";
}

// Function to update statistics display
function updateStatisticsDisplay() {
  const totalTasks = statistics.tasksCreated;
  const completionRate =
    totalTasks > 0
      ? ((statistics.tasksCompleted / totalTasks) * 100).toFixed(2)
      : 0;

  const completionRateByDayData = Object.entries(statistics.completionRateByDay)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return days.indexOf(a.day) - days.indexOf(b.day);
    });

  const completionRateByPriorityData = Object.entries(
    statistics.completionRateByPriority
  ).map(([priority, count]) => ({ priority, count }));

  const statisticsContent = document.getElementById("statistics-content");
  statisticsContent.innerHTML = `
    <h2><i class="fas fa-chart-bar"></i> Your Statistics</h2>
    <p><i class="fas fa-plus-circle"></i> Tasks Created: ${statistics.tasksCreated}</p>
    <p><i class="fas fa-check-circle"></i> Tasks Completed: ${statistics.tasksCompleted}</p>
    <p><i class="fas fa-percentage"></i> Overall Completion Rate: ${completionRate}%</p>
    <p><i class="fas fa-fire"></i> Highest Streak: ${statistics.highestStreak} days</p>
    
    <h3><i class="fas fa-calendar-week"></i> Completion Rate by Day</h3>
    <div id="completion-by-day-chart"></div>
    
    <h3><i class="fas fa-layer-group"></i> Completion Rate by Priority</h3>
    <div id="completion-by-priority-chart"></div>
  `;

  // Create charts using Chart.js
  createChart(
    "completion-by-day-chart",
    "bar",
    "Completion Rate by Day",
    completionRateByDayData,
    "day",
    "count"
  );
  createChart(
    "completion-by-priority-chart",
    "pie",
    "Completion Rate by Priority",
    completionRateByPriorityData,
    "priority",
    "count"
  );
}

// Function to create a chart
function createChart(elementId, type, title, data, labelKey, dataKey) {
  const ctx = document.getElementById(elementId).getContext("2d");
  new Chart(ctx, {
    type: type,
    data: {
      labels: data.map((item) => item[labelKey]),
      datasets: [
        {
          label: title,
          data: data.map((item) => item[dataKey]),
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(199, 199, 199, 0.8)",
          ],
          borderColor: "rgba(255, 255, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: title,
        },
      },
    },
  });
}

// Function to reset pagination
function resetPagination() {
  currentPage = 1;
}

// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Function to show loading indicator
function showLoading() {
  document.getElementById("loading-indicator").classList.remove("hidden");
}

// Function to hide loading indicator
function hideLoading() {
  document.getElementById("loading-indicator").classList.add("hidden");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  setInitialCreationDate();
  loadData();
  renderTasks();
  updateGamificationDisplay();

  // Set initial theme
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
    document.getElementById("checkbox").checked = true;
  }
});

taskForm.addEventListener("submit", addTask);
document.getElementById("checkbox").addEventListener("change", toggleTheme);
searchInput.addEventListener("input", debouncedSearch);
filterSelect.addEventListener("change", filterTasks);
settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
saveSettingsButton.addEventListener("click", saveSettings);
clearDataButton.addEventListener("click", () => {
  if (
    confirm(
      "Are you sure you want to clear all data? This action cannot be undone."
    )
  ) {
    clearData();
    closeSettings();
  }
});
statisticsButton.addEventListener("click", openStatistics);
closeStatisticsButton.addEventListener("click", closeStatistics);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "n":
        e.preventDefault();
        document.getElementById("task-title").focus();
        break;
      case "f":
        e.preventDefault();
        searchInput.focus();
        break;
      case "s":
        e.preventDefault();
        openSettings();
        break;
      case "t":
        e.preventDefault();
        toggleTheme();
        break;
    }
  } else if (e.key === "Escape") {
    closeSettings();
    closeStatistics();
  }
});

// Add keyboard navigation for tasks
taskList.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    const tasks = taskList.querySelectorAll(".task-item");
    const currentTask = document.activeElement.closest(".task-item");
    const currentIndex = Array.from(tasks).indexOf(currentTask);
    let nextIndex;

    if (e.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tasks.length;
    } else {
      nextIndex = (currentIndex - 1 + tasks.length) % tasks.length;
    }

    tasks[nextIndex].querySelector("button").focus();
  }
});

// Make username globally available for confetti.js
window.username = username;
