# TaskTeam

TaskTeam is a full-stack team task management app with a React frontend and an Express + MongoDB backend.

## Structure

- `client` - Vite + React application
- `server` - Express API with JWT auth, RBAC, and Mongoose models

## Setup

1. Install dependencies at the root:

```bash
npm install
```

2. Install workspace dependencies if needed:

```bash
npm install -w client
npm install -w server
```

3. Configure environment files:

- `server/.env`

```env
PORT=5000
JWT_SECRET=change-me
MONGODB_URI=mongodb://127.0.0.1:27017/taskteam
CLIENT_URL=http://localhost:5173
```

- `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

4. Start MongoDB and make sure the target database is available.

5. Seed the initial admin user:

```bash
npm run seed -w server
```

6. Run both apps:

```bash
npm run dev
```

## Database

The server connects to MongoDB through Mongoose on startup. There are no SQL migrations or sync steps.

## Authentication

- Register and log in through `/api/auth/register` and `/api/auth/login`
- JWT is stored in `localStorage` on the client
- Axios automatically attaches the token as a `Bearer` header

## Roles

- `admin`
- `project_manager`
- `developer`

## Seeded Admin

If no admin exists, the seed script creates one. Override the defaults with:

- `SEED_ADMIN_NAME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

