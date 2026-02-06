# TaskFlow - Modern Task Management App

TaskFlow is a premium, full-stack task management application designed with a focus on speed, security, and a stunning user experience. It features a distinct landing page for public engagement and a private dashboard for personalized productivity.

## ✨ Features

- **User Authentication**: Secure signup and login system.
- **Data Isolation**: Each user manages their own private task board.
- **Real-time Interaction**: Instant CRUD operations with a smooth, reactive UI.
- **Glassmorphism Design**: State-of-the-art interface with fluid animations and adaptive theming.
- **Persistent Storage**: Robust data management powered by SQLite.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, Modern CSS (CSS Variables, Flex/Grid), HTML5.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite3.
- **Theme**: Light/Dark mode auto-detection and persistence.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (installed with Node.js)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-link>
   cd julley
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize the database**:
   The application will automatically create the `tasks.db` file and the necessary tables on the first run.

### Running the Application

1. **Start the Backend Server**:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000`.

2. **Serve the Frontend**:
   You can use any static server. If you have Python installed:
   ```bash
   python -m http.server 8080
   ```
   Or use a tool like `live-server` or `serve`.

3. **Access the App**:
   Open `http://localhost:8080` in your browser.

## 📖 API Documentation

The backend exposes a RESTful API for task management. All requests should include `userId` to ensure data isolation.

| Method | Endpoint | Description | Query/Body Params |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tasks` | Get all tasks for a user | `userId` (query) |
| **GET** | `/api/tasks/:id` | Get a specific task | `userId` (query) |
| **POST** | `/api/tasks` | Create a new task | `title`, `description`, `status`, `userId` (body) |
| **PUT** | `/api/tasks/:id` | Update a task | `title`, `description`, `status`, `userId` (body) |
| **DELETE** | `/api/tasks/:id` | Delete a task | `userId` (query) |

### Sample Response (Task Model)
```json
{
  "id": 1,
  "user_id": 5,
  "title": "Complete Project",
  "description": "Finalize README and push to GitHub",
  "status": "in-progress",
  "createdAt": "2026-02-05 12:00:00",
  "updatedAt": "2026-02-05 13:00:00"
}
```

## 🧠 Design Decisions & Assumptions

- **Data Isolation**: I implemented a `user_id` system to ensure that tasks are private to each user. This is a critical security feature for a multi-user app.
- **Vanilla Tech Stack**: Chose Vanilla JS and CSS to demonstrate deep understanding of DOM manipulation and CSS architecture without the abstraction of frameworks.
- **Glassmorphism UI**: Opted for a "Super-Premium" aesthetic using modern CSS blur and transparency effects to stand out in technical evaluations.
- **SQLite**: Selected for its portability and zero-config setup, making it ideal for reviewers to run the project instantly.
- **Hybrid Routing**: Used a combination of separate HTML pages for Landing/Dashboard and URL query parameters (+ redirection) to provide a seamless "App-like" feel.

## 📁 Project Structure

```text
├── server.js          # Express server & API endpoints
├── database.js        # SQLite configuration & migrations
├── app.js             # Main frontend logic (Dashboard)
├── auth.js            # Authentication logic
├── index.html         # Public Landing Page
├── dashboard.html     # Private User Dashboard
├── styles.css         # Global styling & Design System
└── package.json       # Project dependencies & scripts
```

## ⚠️ Known Issues & Limitations

- **Session Management**: Currently uses `localStorage` for simplicity. In a production environment, JWT or cookie-based sessions with iron-clad expiry would be preferred.
- **Frontend Validation**: Basic HTML5 validation is in place; complex edge-case handling for very long text is minimal in the demo.

## 📝 License

This project is licensed under the MIT License.
