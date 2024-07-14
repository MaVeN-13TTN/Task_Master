# Task Master: A Gamified To-Do App

## Overview

Task Master is a feature-rich, gamified to-do application designed to boost productivity and make task management engaging. It combines traditional to-do list functionality with game-like elements to motivate users to complete their tasks.

## Features

- Create, edit, and delete tasks with titles, descriptions, due dates, and priority levels
- Mark tasks as complete/incomplete
- Search and filter tasks
- Dark mode toggle
- Gamification elements:
  - Points system
  - Achievement badges
  - Streaks for consistent task completion
- Progress visualization
- Task analytics and statistics
- Personalized user experience
- Confetti celebrations for task completion and badge earning

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js (for data visualization)
- Font Awesome (for icons)
- Local Storage API (for data persistence)

## Project Structure

task-master/
│
├── index.html
├── styles.css
├── scripts.js
├── confetti.js
└── README.md

## Main Components and Their Roles

1. **index.html**: The main HTML file that structures the app's user interface.

2. **styles.css**: Contains all the styling for the application, including the dark mode theme.

3. **scripts.js**: The main JavaScript file that handles:

   - Task management (CRUD operations)
   - Gamification logic
   - Data persistence
   - UI updates
   - Search and filter functionality
   - Analytics and statistics

4. **confetti.js**: Manages the confetti animation for celebrations.

## How to Build and Run

1. Clone the repository:

```

git clone https://github.com/MaVeN-13TTN/Task_Master.git
```

2. Navigate to the project directory:

```

cd Task_Master

```

3. Open `index.html` in a modern web browser.

That's it! The app runs entirely in the browser and uses Local Storage for data persistence, so no server setup is required.

## Usage

- Add a new task using the form at the top of the page.
- Click on a task to mark it as complete/incomplete.
- Use the search bar to find specific tasks.
- Use the filter dropdown to view tasks by their status or priority.
- Toggle dark mode using the switch in the header.
- View your progress and statistics in the gamification section.
- Enjoy confetti celebrations when you complete tasks or earn badges!

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check [issues page](https://github.com/yourusername/task-master/issues) if you want to contribute.

## License

This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
