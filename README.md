# Delightcuts - Project Setup Guide

## Prerequisites
- Integrated Development Environment (IDE) of your choice (VSCode, WebStorm, etc.)
- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- MongoDB (or your preferred database system)

## Installation

### 1. Download the Project
- Download the repository as a ZIP file
- Extract the contents to your preferred working directory

### 2. Environment Setup
- Rename all configuration files:
  - Change `sample.env` to `.env` in:
    - `/frontend` directory
    - `/backend` directory
    - `/admin` directory
- Configure your environment variables in each `.env` file

### 3. Install Dependencies
Open each project folder in your IDE's terminal and run:
```bash
npm install
```

### 4. Start the Application
Run the following commands in their respective directories:
```bash
# Start Frontend
cd frontend
npm run dev

# Start Backend
cd backend
npm run server

# Start Admin Panel
cd admin
npm run dev
```

Your application should now be running successfully. Access the frontend and admin panel via your browser and ensure the backend is properly connected to the database.
