# Task Manager (Docker App)

A high-performance, full-stack web application designed for users to manage their daily tasks, track completion statuses, and organize work efficiently.

🌟 Key Features Implemented
*   **Clean Full-Stack Architecture:** Strictly separated client (React) and API server (Express/Node.js) codebases.
*   **MongoDB Docker Integration:** Simplified local database orchestration via `docker-compose.yml` mapped to an isolated port (`27018`) to prevent host conflicts, along with containerized React client and Express server.
*   **JWT Authentication & Protection:** Complete sign-up, sign-in, and authorization flows. Only logged-in users can create, view, update, or delete their own tasks.
*   **Task Status Tracking:** Users can view their tasks based on completion status, keeping track of deadlines and categories.
*   **Responsive UI Framework:** Integrated with Tailwind CSS for building a sleek, responsive, and modern user interface.

📁 Repository Structure
```
Docker-App/
├── docker-compose.yml        # Docker Compose configuration for Client, Server, and MongoDB
├── Jenkinsfile               # Jenkins CI/CD Pipeline Configuration
├── terraform/                # Infrastructure as Code
├── server/                   # Express REST API codebase
│   ├── src/
│   │   ├── controllers/      # Route controllers (authController, taskController)
│   │   ├── models/           # Mongoose schemas (User, Task)
│   │   ├── routes/           # API Routing (authRoutes, taskRoutes)
│   │   └── utility/          # Middlewares and helpers (authMiddleware)
│   ├── index.js              # Server entry point
│   └── package.json
└── client/                   # React frontend codebase
    ├── src/
    │   └── ...               # React pages and components
    └── package.json
```

📊 System Architecture & Workflows
Below is the request-response lifecycle sequence for the Task Manager application.

🔄 Request Lifecycle Workflows
1. 🔐 User Registration & Session Initialization
2. 🆕 Posting a New Task (User)
3. 🔍 Browsing & Filtering Tasks by Status (User)
4. 🔄 Updating Task Details and Status (User)

🚀 Quick Start Guide
Follow these steps to run the complete stack locally:

### 1. Run Everything via Docker (Recommended)
In the root directory, spin up the entire application (MongoDB, Backend Server, and Frontend Client) simultaneously:

```bash
docker compose up -d --build
```
*Note: MongoDB is mapped to port 27018, the Server runs on port 5000, and the Client runs on port 3000.*
The application will be accessible at `http://localhost:3000`.

### 2. Manual Setup (Alternative)
**Database Setup (Docker)**
If you prefer running services manually, you can just start the Mongo service:
```bash
docker compose up -d mongo
```

**Backend Server Setup**
Navigate into the server folder and run the backend:
```bash
cd server
npm install
npm run start
```
*The REST API will run on http://localhost:5000.*

**Frontend App Setup**
Open a new terminal window in the root directory and run the frontend:
```bash
cd client
npm install
npm start
```
*Open http://localhost:3000 in your browser.*

🔌 API Endpoints
The API is fully documented and structured under the `/api` prefix (configurable). Private endpoints require a JSON Web Token (JWT) sent in the HTTP Authorization header.

🔑 Authentication Endpoints
| Endpoint | Method | Auth Required | Description | Request Body Example |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | ❌ No | Registers a new user. | `{"username": "johndoe", "password": "password123"}` |
| `/api/auth/login` | `POST` | ❌ No | Authenticates user and returns JWT. | `{"username": "johndoe", "password": "password123"}` |

🛠️ Task Endpoints
| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/tasks` | `GET` | 🔒 Yes | Lists all tasks belonging to the current user. |
| `/api/tasks/status` | `GET` | 🔒 Yes | Lists tasks filtered by their completion status. |
| `/api/tasks/:id` | `GET` | 🔒 Yes | Fetches a single task by ID. |
| `/api/tasks` | `POST` | 🔒 Yes | Creates a new task. |
| `/api/tasks/:id` | `PUT` | 🔒 Yes | Updates an existing task by ID. |
| `/api/tasks/:id` | `DELETE` | 🔒 Yes | Deletes a task by ID. |

📌 Endpoint Details & Payload Specs

🔑 Authentication Endpoints
**1. 🔍 Register a New User**
*   **Method & Path:** `POST http://localhost:5000/api/auth/register`
*   **Example curl Request:**
    ```bash
    curl -X POST http://localhost:5000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{
        "username": "johndoe",
        "password": "password123"
      }'
    ```

**2. 🔑 Authenticate (Login) User**
*   **Method & Path:** `POST http://localhost:5000/api/auth/login`
*   **Example curl Request:**
    ```bash
    curl -X POST http://localhost:5000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "username": "johndoe",
        "password": "password123"
      }'
    ```

🛠️ Task Endpoints
**1. 🔍 List Tasks**
*   **Method & Path:** `GET http://localhost:5000/api/tasks`
*   **Headers:** `Authorization: Bearer <your_jwt_token>`
*   **Example curl Request:**
    ```bash
    curl -X GET http://localhost:5000/api/tasks \
      -H "Authorization: Bearer <your_jwt_token>"
    ```

**2. 🆕 Create a Task (Private)**
*   **Method & Path:** `POST http://localhost:5000/api/tasks`
*   **Headers:** `Authorization: Bearer <your_jwt_token>`
*   **Example curl Request:**
    ```bash
    curl -X POST http://localhost:5000/api/tasks \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer <your_jwt_token>" \
      -d '{
        "title": "Fix leaking bathroom faucet",
        "description": "The master bathroom faucet is dripping continuously.",
        "completed": false,
        "subject": "Maintenance",
        "dueDate": "2026-05-30T10:00:00Z"
      }'
    ```

**3. 🔄 Update Task Status (Private)**
*   **Method & Path:** `PUT http://localhost:5000/api/tasks/:id`
*   **Headers:** `Authorization: Bearer <your_jwt_token>`
*   **Example curl Request:**
    ```bash
    curl -X PUT http://localhost:5000/api/tasks/65f123456789abcdef012345 \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer <your_jwt_token>" \
      -d '{
        "completed": true
      }'
    ```

**4. 🗑️ Delete Task (Private)**
*   **Method & Path:** `DELETE http://localhost:5000/api/tasks/:id`
*   **Headers:** `Authorization: Bearer <your_jwt_token>`
*   **Example curl Request:**
    ```bash
    curl -X DELETE http://localhost:5000/api/tasks/65f123456789abcdef012345 \
      -H "Authorization: Bearer <your_jwt_token>"
    ```

⚙️ Environment Variables
**Backend (`server/.env`)**
Create a `.env` file inside the `server` directory (or pass them via Docker):
```env
PORT=5000
MONGODB_URI=mongodb://mongo:27017/task-manager # If using Docker Compose
# MONGODB_URI=mongodb://127.0.0.1:27018/task-manager # If running backend locally without Docker Compose
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**Frontend (`client/.env`)**
Create a `.env` file inside the `client` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```
