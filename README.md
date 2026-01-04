# HasCart Admin Panel

A React-based admin panel for HasCart management system.

## Features

- User creation form
- Modern, responsive UI
- Backend integration (port 3000)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   - Update `.env.local` with your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Make sure your backend is running on the configured port

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
  ├── components/
  │   └── UserCreation.jsx    # User creation form component
  ├── services/
  │   └── api.js              # API service for backend communication
  ├── App.jsx                 # Main app component
  ├── main.jsx                # Entry point
  └── index.css               # Global styles
```

## Environment Variables

- `VITE_API_BASE_URL` - The base URL of your backend server (default: `http://localhost:3000`)

The Vite proxy will forward requests from `/api/*` to `${VITE_API_BASE_URL}/api/*`

## API Endpoints

The app expects the backend to have the following endpoint:
- `POST ${VITE_API_BASE_URL}/api/users` - Create a new user

## Next Steps

- Add admin functionality after user creation
- Implement authentication and login


git pull
npm install        # only if deps changed
npm run build
sudo rm -rf /var/www/hascart-admin/*
sudo cp -r dist/* /var/www/hascart-admin/
sudo systemctl reload nginx