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
const taskCompletionModal = document.getElementById("task-completion-modal");
const closetaskCompletionModal = document.getElementById(
  "close-task-completion-modal"
);
const badgeModal = document.getElementById("badge-modal");
const closeBadgeModal = document.getElementById("close-badge-modal");

// Task array to store tasks
let tasks = [];

// Gamification variables
let streak = 0;
let lastCompletionDate = null;
let username = "";

const badges = [
  {
    name: "Beginner",
    tasks: 5,
    icon: "🥉",
    description: "You're off to a great start!",
  },
  {
    name: "Go-Getter",
    tasks: 15,
    icon: "🥈",
    description: "You're making excellent progress!",
  },
  {
    name: "Achiever",
    tasks: 30,
    icon: "🥇",
    description: "You're on fire! Keep it up!",
  },
  {
    name: "Task Master",
    tasks: 50,
    icon: "👑",
    description: "You're a true productivity champion!",
  },
];

// Initialize user's badge
let currentBadge = {
  name: "Novice",
  tasks: 0,
  icon: "🌱",
  description: "Everyone starts somewhere. You've got this!",
};

// Statistics object
let statistics = {
  tasksCompleted: 0,
  tasksCreated: 0,
  highestStreak: 0,
  completionRateByDay: {},
  completionRateByPriority: { low: 0, medium: 0, high: 0 },
};

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
    currentBadge = storedData.currentBadge || {
      name: "Novice",
      tasks: 0,
      icon: "🌱",
      description: "Everyone starts somewhere. You've got this!",
    };
  } else {
    clearData();
  }
}

// Function to save data to localStorage
function saveData() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Filter tasks to only include those from the last 7 days
  const recentTasks = tasks.filter(
    (task) => new Date(task.creationDate) >= oneWeekAgo
  );

  const dataToStore = {
    tasks: recentTasks,
    streak,
    lastCompletionDate,
    statistics,
    username,
    currentBadge,
  };
  localStorage.setItem("todoAppData", JSON.stringify(dataToStore));
}

// Function to clear all data
function clearData() {
  tasks = [];
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
  currentBadge = {
    name: "Novice",
    tasks: 0,
    icon: "🌱",
    description: "Everyone starts somewhere. You've got this!",
  };
  saveData();
  renderTasks();
  updateGamificationDisplay();
}
// Global variables to track edit mode
let isEditMode = false;
let editingTaskId = null;

// Function to add a new task or update an existing one
async function addOrUpdateTask(e) {
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

  if (isEditMode) {
    // Update existing task
    const taskIndex = tasks.findIndex((t) => t.id === editingTaskId);
    if (taskIndex !== -1) {
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description,
        creationDate,
        dueDate,
        priority,
        tags,
      };
    }
    isEditMode = false;
    editingTaskId = null;
  } else {
    // Add new task
    const newTask = {
      id: Date.now(),
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
  }

  await saveData();
  updateGamificationDisplay();
  renderTasks();
  taskForm.reset();
  setInitialCreationDate();

  // Reset form to "Add Task" mode
  const submitButton = document.querySelector(
    '#task-form button[type="submit"]'
  );
  submitButton.innerHTML = '<i class="fas fa-plus"></i> Add Task';

  hideLoading();
}

// Function to edit a task
function editTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  isEditMode = true;
  editingTaskId = taskId;

  document.getElementById("task-title").value = task.title;
  document.getElementById("task-description").value = task.description;
  document.getElementById("task-creation-date").value = task.creationDate;
  document.getElementById("task-due-date").value = task.dueDate;
  document.getElementById("task-priority").value = task.priority;
  document.getElementById("task-tags").value = task.tags.join(", ");

  const submitButton = document.querySelector(
    '#task-form button[type="submit"]'
  );
  submitButton.innerHTML = '<i class="fas fa-save"></i> Update Task';

  // Scroll to the form
  taskForm.scrollIntoView({ behavior: "smooth" });
}

// Update the event listener for the form submission
taskForm.addEventListener("submit", addOrUpdateTask);

// Function to toggle task completion
async function toggleComplete(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  const wasCompleted = task.completed;
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;

  if (task.completed && !wasCompleted) {
    const oldCompletedTasks = statistics.tasksCompleted;
    const badgeEarned = await updateBadgesAndStreak();
    statistics.completionRateByPriority[task.priority]++;

    // Animate progress bar
    const currentBadge =
      badges.filter((badge) => oldCompletedTasks >= badge.tasks).pop() ||
      badges[0];
    const nextBadge =
      badges.find((badge) => oldCompletedTasks < badge.tasks) ||
      badges[badges.length - 1];
    const fromPercentage = (oldCompletedTasks / nextBadge.tasks) * 100;
    const toPercentage = (statistics.tasksCompleted / nextBadge.tasks) * 100;
    animateProgressBar(fromPercentage, toPercentage);

    // Display task completion modal
    await displayTaskCompletionModal(task);

    // If a badge was earned, display the badge modal after task completion modal is closed
    if (badgeEarned) {
      await displayBadgeModal(badgeEarned);
    }
  } else if (!task.completed && wasCompleted) {
    statistics.tasksCompleted--;
    statistics.completionRateByPriority[task.priority]--;
  }

  await saveData();
  updateGamificationDisplay();
  renderTasks();
}

// Function to delete a task
async function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    if (task.completed) {
      statistics.tasksCompleted--;
      statistics.completionRateByPriority[task.priority]--;
    }
    tasks.splice(taskIndex, 1);
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

  // Check for new badge
  const newBadge = badges.find(
    (badge) => statistics.tasksCompleted === badge.tasks
  );
  let badgeEarned = null;
  if (newBadge && newBadge.name !== currentBadge.name) {
    badgeEarned = newBadge;
    currentBadge = newBadge;
  }

  await saveData();
  updateGamificationDisplay();
  return badgeEarned;
}

// Function to update gamification display
function updateGamificationDisplay() {
  const completedTasks = statistics.tasksCompleted;
  const nextBadge =
    badges.find((badge) => completedTasks < badge.tasks) ||
    badges[badges.length - 1];
  const tasksToNextBadge = nextBadge.tasks - completedTasks;
  const progressPercentage = (completedTasks / nextBadge.tasks) * 100;

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
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress" style="width: ${progressPercentage}%"></div>
      </div>
      <div class="progress-labels">
        <span class="progress-start">${currentBadge.name}</span>
        <span class="progress-end">${nextBadge.name}</span>
      </div>
    </div>
    <p class="progress-info">
      <i class="fas fa-award"></i> Next badge: ${nextBadge.icon} ${
    nextBadge.name
  }
      <br>
      <span class="tasks-to-go">${tasksToNextBadge} task${
    tasksToNextBadge !== 1 ? "s" : ""
  } to go</span>
    </p>
  `;

  // Add tooltip functionality
  const progressBar = gamificationSection.querySelector(".progress-bar");
  const tooltip = document.createElement("div");
  tooltip.classList.add("progress-tooltip");
  tooltip.textContent = `${Math.round(progressPercentage)}%`;
  progressBar.appendChild(tooltip);

  progressBar.addEventListener("mousemove", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    tooltip.style.left = `${x}px`;
  });
}

function renderTasks() {
  taskList.innerHTML = "";
  const template = document.getElementById("task-item-template");

  tasks.forEach((task) => {
    const taskElement = template.content.cloneNode(true).firstElementChild;
    taskElement.dataset.taskId = task.id;

    const checkbox = taskElement.querySelector(".task-checkbox");
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleComplete(task.id));

    const title = taskElement.querySelector(".task-title");
    title.textContent = task.title;

    const editButton = taskElement.querySelector(".edit-task");
    editButton.addEventListener("click", () => {
      editTask(task.id);
      // Scroll to the form
      document
        .getElementById("task-form")
        .scrollIntoView({ behavior: "smooth" });
    });

    const deleteButton = taskElement.querySelector(".delete-task");
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    const toggleButton = taskElement.querySelector(".toggle-details");
    toggleButton.addEventListener("click", () => {
      const details = taskElement.querySelector(".task-details");
      details.classList.toggle("hidden");
      toggleButton.querySelector("i").classList.toggle("fa-chevron-down");
      toggleButton.querySelector("i").classList.toggle("fa-chevron-up");
    });

    const description = taskElement.querySelector(".task-description");
    description.textContent = task.description || "No description provided";

    const dueDate = taskElement.querySelector(".due-date-value");
    dueDate.textContent = task.dueDate || "No due date set";

    const priority = taskElement.querySelector(".task-priority");
    priority.textContent = `Priority: ${task.priority}`;
    priority.classList.add(`priority-${task.priority}`);

    const tagsContainer = taskElement.querySelector(".task-tags");
    tagsContainer.innerHTML = ""; // Clear existing tags
    if (task.tags && task.tags.length > 0) {
      task.tags.forEach((tag) => {
        const tagElement = document.createElement("span");
        tagElement.className = "task-tag";
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
    } else {
      const noTagElement = document.createElement("span");
      noTagElement.className = "task-tag no-tag";
      noTagElement.textContent = "No tags";
      tagsContainer.appendChild(noTagElement);
    }

    if (task.completed) {
      taskElement.classList.add("completed");
    } else {
      taskElement.classList.remove("completed");
    }

    taskList.appendChild(taskElement);
  });

  updateAnalytics();

  // If there are no tasks, display a message
  if (tasks.length === 0) {
    const noTasksMessage = document.createElement("p");
    noTasksMessage.textContent = "No tasks yet. Add a task to get started!";
    noTasksMessage.className = "no-tasks-message";
    taskList.appendChild(noTasksMessage);
  }
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
  updateThemeIcons();
}

// Function to update theme icons
function updateThemeIcons() {
  const isDarkMode = document.body.classList.contains("dark-mode");
  const sunIcon = document.querySelector(".theme-switch-wrapper .fa-sun");
  const moonIcon = document.querySelector(".theme-switch-wrapper .fa-moon");

  sunIcon.style.opacity = isDarkMode ? "0.5" : "1";
  moonIcon.style.opacity = isDarkMode ? "1" : "0.5";
}

// Function to search tasks
const debouncedSearch = debounce(() => {
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

// Function to open modal
function openModal(modal) {
  modal.style.display = "block";
}

// Function to close modal
function closeModal(modal) {
  modal.style.display = "none";
}

// Function to open settings modal
function openSettings() {
  openModal(settingsModal);
  document.getElementById("username-input").value = username;
}

// Function to close settings modal
function closeSettings() {
  closeModal(settingsModal);
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
  openModal(statisticsModal);
  const daysToShow = parseInt(document.getElementById("date-range").value);
  updateStatisticsDisplay(daysToShow);
}

// Function to close statistics modal
function closeStatistics() {
  closeModal(statisticsModal);
}

// Function to update statistics display
function updateStatisticsDisplay(daysToShow = 7) {
  const statisticsContent = document.getElementById("statistics-content");

  // Calculate the start date based on the selected range
  const endDate = new Date();
  const startDate = new Date(
    endDate.getTime() - daysToShow * 24 * 60 * 60 * 1000
  );

  // Filter tasks based on date range
  const filteredTasks = tasks.filter((task) => {
    const taskDate = new Date(task.completedAt || task.creationDate);
    return taskDate >= startDate && taskDate <= endDate;
  });

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((task) => task.completed).length;
  const completionRate =
    totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

  // Prepare data for charts
  const completionRateByDay = {};
  const completionRateByPriority = { low: 0, medium: 0, high: 0 };

  filteredTasks.forEach((task) => {
    if (task.completed) {
      const dayOfWeek = new Date(task.completedAt).toLocaleDateString("en-US", {
        weekday: "long",
      });
      completionRateByDay[dayOfWeek] =
        (completionRateByDay[dayOfWeek] || 0) + 1;
      completionRateByPriority[task.priority]++;
    }
  });

  const completionRateByDayData = Object.entries(completionRateByDay)
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
    completionRateByPriority
  ).map(([priority, count]) => ({ priority, count }));

  // Update statistics content
  statisticsContent.innerHTML = `
    <p><i class="fas fa-tasks"></i> Total Tasks: ${totalTasks}</p>
    <p><i class="fas fa-check-circle"></i> Completed Tasks: ${completedTasks}</p>
    <p><i class="fas fa-percentage"></i> Completion Rate: ${completionRate}%</p>
    
    <h3><i class="fas fa-calendar-week"></i> Completion Rate by Day</h3>
    <canvas id="completion-by-day-chart"></canvas>
    
    <h3><i class="fas fa-layer-group"></i> Completion Rate by Priority</h3>
    <canvas id="completion-by-priority-chart"></canvas>
  `;

  // Create charts with interactivity
  createInteractiveChart(
    "completion-by-day-chart",
    "bar",
    "Completion Rate by Day",
    completionRateByDayData,
    "day",
    "count"
  );
  createInteractiveChart(
    "completion-by-priority-chart",
    "pie",
    "Completion Rate by Priority",
    completionRateByPriorityData,
    "priority",
    "count"
  );
}

function createInteractiveChart(
  elementId,
  type,
  title,
  data,
  labelKey,
  dataKey
) {
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
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed !== null) {
                label += context.parsed;
                if (type === "pie") {
                  label += " tasks";
                }
              }
              return label;
            },
          },
        },
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const label = data[index][labelKey];
          const value = data[index][dataKey];
          alert(`${label}: ${value} tasks`);
        }
      },
    },
  });
}

function animateProgressBar(fromPercentage, toPercentage) {
  const progressElement = document.querySelector(".progress");
  const tooltipElement = document.querySelector(".progress-tooltip");
  const duration = 1000; // Animation duration in milliseconds
  const startTime = performance.now();

  function step(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    const currentPercentage =
      fromPercentage + (toPercentage - fromPercentage) * progress;

    progressElement.style.width = `${currentPercentage}%`;
    tooltipElement.textContent = `${Math.round(currentPercentage)}%`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function displayTaskCompletionModal(task) {
  return new Promise((resolve) => {
    const taskCompletionMessage = document.getElementById(
      "task-completion-message"
    );
    const taskStreakInfo = document.getElementById("task-streak-info");

    const congratulatoryMessages = [
      "Great job! You're making progress!",
      "Awesome work! Keep it up!",
      "You're on a roll! Fantastic!",
      "Well done! You're crushing it!",
      "Impressive! You're unstoppable!",
    ];

    const randomMessage =
      congratulatoryMessages[
        Math.floor(Math.random() * congratulatoryMessages.length)
      ];

    taskCompletionMessage.innerHTML = `
      <p>${randomMessage}</p>
      <p>You completed: <strong>${task.title}</strong></p>
    `;

    taskStreakInfo.innerHTML = `
      <p>Current Streak: ${streak} day${streak !== 1 ? "s" : ""}</p>
      <p>Total Tasks Completed: ${statistics.tasksCompleted}</p>
    `;

    openModal(taskCompletionModal);

    closetaskCompletionModal.onclick = () => {
      closeModal(taskCompletionModal);
      resolve();
    };

    // Trigger confetti celebration
    celebrateAchievement("task", getPriorityColor(task.priority));
  });
}

function displayBadgeModal(badge) {
  return new Promise((resolve) => {
    const badgeDisplay = document.getElementById("badge-display");
    badgeDisplay.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <div class="badge-name">${badge.name}</div>
      <div class="badge-description">${badge.description}</div>
    `;

    openModal(badgeModal);

    closeBadgeModal.onclick = () => {
      closeModal(badgeModal);
      resolve();
    };

    // Trigger confetti celebration
    celebrateAchievement(
      "badge",
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim()
    );
  });
}

// Function to show loading indicator
function showLoading() {
  document.getElementById("loading-indicator").classList.remove("hidden");
}

// Function to hide loading indicator
function hideLoading() {
  document.getElementById("loading-indicator").classList.add("hidden");
}

// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
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
    document.getElementById("theme-toggle").checked = true;
  }
  updateThemeIcons();

  taskForm.addEventListener("submit", addOrUpdateTask);
  document
    .getElementById("theme-toggle")
    .addEventListener("change", toggleTheme);
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

  const dateRangeSelect = document.getElementById("date-range");
  const updateDateRangeButton = document.getElementById("update-date-range");

  updateDateRangeButton.addEventListener("click", () => {
    const daysToShow = parseInt(dateRangeSelect.value);
    updateStatisticsDisplay(daysToShow);
  });
});

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
