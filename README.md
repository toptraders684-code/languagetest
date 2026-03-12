# AutoCRM - Internal Car Resale CRM

A lightweight internal CRM system for second-hand car resale companies. Manage car inventory, leads, buyers, deals, follow-ups, and sales reporting.

## Tech Stack

- **Backend:** Node.js, Express.js, PostgreSQL
- **Frontend:** React, Tailwind CSS, Recharts
- **Auth:** JWT-based authentication with bcrypt password hashing
- **Deployment:** Docker & Docker Compose

## Quick Start with Docker

```bash
# Clone and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
```

Default login credentials:
- **Email:** admin@carcrm.com
- **Password:** admin123

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
cp .env.example .env    # Edit with your database credentials
npm install
npm run migrate         # Run database migrations
npm run dev             # Start with hot reload on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm start               # Start on port 3000 (proxies API to 5000)
```

## CRM Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | KPI cards, lead source pie chart, monthly sales bar chart, top selling models |
| **Cars** | Full inventory management with search/filter, status tracking (Available/Reserved/Sold) |
| **Leads** | Lead management with auto-assignment, activity timeline, status pipeline |
| **Test Drives** | Schedule and track test drives, grouped calendar view |
| **Deals** | Deal lifecycle from negotiation to completion, auto-marks car as sold |
| **Follow-ups** | Today's follow-ups view, completion tracking |
| **Reports** | Revenue trends, deals per month, lead source distribution, top models |
| **Users** | Admin user management with role-based access control |

## Roles & Permissions

| Permission | Admin | Manager | Sales Executive |
|-----------|-------|---------|-----------------|
| Manage Users | Yes | No | No |
| Manage Cars | Yes | Yes | View only |
| View All Deals | Yes | Yes | Own deals |
| Manage Leads | Yes | Yes | Own leads |
| View Reports | Yes | Yes | No |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |
| GET/POST/PUT/DELETE | /api/users | User CRUD (admin only) |
| GET/POST/PUT/DELETE | /api/cars | Car inventory CRUD |
| GET/POST/PUT/DELETE | /api/leads | Lead management |
| GET | /api/leads/:id/timeline | Lead activity timeline |
| GET/POST/PUT | /api/testdrives | Test drive scheduling |
| GET/POST/PUT | /api/deals | Deal management |
| GET/POST/PUT | /api/followups | Follow-up tracking |
| GET | /api/dashboard/stats | Dashboard KPIs |
| GET | /api/dashboard/charts | Chart data |

## Smart Features

- **Auto-assign leads** to the sales executive with fewest active leads
- **Auto-mark car as SOLD** when a deal is completed
- **Activity timeline** logs all lead interactions automatically
- **Follow-up reminders** with today's follow-ups view
- **Search & filters** across cars (brand/model) and leads (name/phone)

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Backend server port |
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | crm_db | Database name |
| DB_USER | crm_user | Database user |
| DB_PASSWORD | crm_password | Database password |
| JWT_SECRET | - | JWT signing secret |
| JWT_EXPIRES_IN | 24h | Token expiration |

## Project Structure

```
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/       # Auth, file upload middleware
│   ├── migrations/      # SQL schema & seed data
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   └── server.js        # Express app entry point
├── frontend/
│   └── src/
│       ├── components/  # Shared UI components
│       ├── context/     # React context (Auth)
│       ├── hooks/       # Custom hooks (useFetch)
│       ├── pages/       # Page components
│       └── services/    # API client
├── docker-compose.yml
└── README.md
```

## Future AI Features (Planned)

- **Lead Scoring:** AI-powered lead quality assessment based on engagement patterns
- **Price Suggestion:** Market-based pricing recommendations for car inventory
