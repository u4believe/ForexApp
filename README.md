# PrimeVault Capital

A professional cryptocurrency investment platform with bi-weekly returns, KYC verification, and a full admin dashboard.

## Tech Stack
- **Frontend**: React 18 + Vite (dark navy/gold theme)
- **Backend**: Node.js + Express
- **Database**: JSON file store (`server/data.json`)
- **Auth**: JWT + bcrypt
- **Email**: Nodemailer (configurable SMTP)
- **File Uploads**: Multer

## Quick Start

### 1. Configure Environment

Edit `.env` in the root directory:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password   # Generate at myaccount.google.com/apppasswords
EMAIL_FROM=PrimeVault Capital <noreply@yourdomain.com>
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@primevaultcapital.com
ADMIN_PASSWORD=your_secure_admin_password
JWT_SECRET=change_this_to_a_long_random_string
```

### 2. Start the App

**Option A — Two terminals:**
```bash
# Terminal 1 (backend):
cd server && node index.js

# Terminal 2 (frontend):
cd client && npx vite
```

**Option B — Shell script:**
```bash
chmod +x start.sh && ./start.sh
```

The app runs at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Admin panel: http://localhost:5173/admin

### 3. Admin Login

Visit `/admin` and use the credentials from `.env`:
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

Admin capabilities:
- View all registered users and their KYC documents
- Set verification status: Pending → Verified / Rejected
- Confirm deposits (which credits user balance)
- Approve or reject withdrawal requests

## User Flow

1. **Register** → email + password
2. **Verify email** → click link in inbox
3. **KYC** → full name, phone, address, government ID photo
4. **Dashboard** — shows `Pending` badge while under review
5. **Deposit** — available immediately (all users)
6. **Withdraw** — only after admin sets status to `Verified`

## Investment Plans

| Plan    | Amount              | ROI (Bi-Weekly) | Profit Fee |
|---------|---------------------|-----------------|------------|
| Starter | $100 – $1,000       | 7% – 15%        | 20%        |
| Growth  | $1,100 – $10,000    | 7% – 15%        | 15%        |
| Premium | $10,100 – $50,000   | 7% – 15%        | 10%        |
| Elite   | $50,100+            | 7% – 15%        | 5%         |

## Production Deployment

```bash
# Build frontend
cd client && npm run build

# Set NODE_ENV and start server (serves built frontend)
cd server && NODE_ENV=production node index.js
```

The server will serve the built React app at `/` and handle all API routes at `/api/*`.

## Gmail App Password Setup

For email to work with Gmail:
1. Enable 2-factor authentication on your Google account
2. Go to: myaccount.google.com → Security → App Passwords
3. Generate a password for "Mail" → copy it to `EMAIL_PASS` in `.env`
