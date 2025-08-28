# Per Diem Full-Stack - Coding Challenge

This project allows users to register/login, create, delete, and filter stores, as well as view, add, and delete product availability while handling both user and store timezones.

### Application Structure

The web app consists of four main parts:

1. **Authentication (Login & Register)**
   - Provides secure login and registration forms with validation
2. **Home Page (Stores List & Filter)**
   - Displays all available stores
   - Provides filtering options to help users find specific stores

3. **My Stores Page** *(click on the store icon in the header to open)*
   - Shows stores created by the logged-in user
   - Allows users to add new stores

4. **Store Page** *(click on a store to open)*
   - Displays store information and products
   - Allows the user to delete the store
   - Supports adding and deleting products within the store

---

#### Project split into two parts:
- **Backend** (`back/`) — API server
- **Frontend** (`front/`) — User-facing app

Each part has its own branch and README with detailed setup instructions.

---

## Project Structure
````
root/
├── back/   # Backend (NestJS) 
└── front/  # Frontend (Next.js)
````

- Backend branch: `feature/backend`
- Frontend branch: `feature/frontend`

---

## Getting Started

### Start the Backend
1. Checkout the backend branch:
   ```bash
   git checkout feature/backend
   ```
2. Navigate to the backend folder:

   ```bash
   cd back
   ```   

3. Follow the instructions in `back/README.md` to install dependencies and run the backend server.

⚠️ The backend should be running before starting the frontend.

### Start the Frontend

1. Open project in a new IDE window.

2. Switch to the frontend branch:
   ```bash
   git checkout feature/frontend
   ```

3. Navigate to the frontend folder:
   ```bash
   cd front
   ```

4. Follow the instructions in `front/README.md` to install dependencies and run the frontend.
