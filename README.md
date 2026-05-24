# Sushmitha Homes Booking

A full-stack booking application for Sushmitha Homes featuring a responsive frontend and a Node.js/Express backend.

## Project Structure

This repository is a monorepo consisting of two main directories:

- **`frontend/`**: The React-based user interface. Built with Vite and Tailwind CSS.
- **`backend/`**: The Express-based REST API that powers the booking functionality.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher is recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd sushmitha-homes-booking
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create a .env file and configure necessary environment variables
# For example:
# PORT=5000

# Start the backend server (in development mode)
npm run dev
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install

# Start the frontend development server
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory if your server relies on it.

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory for React/Vite environment variables if needed.

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```
The optimized production build will be output to the `frontend/dist` directory.

## License
MIT
