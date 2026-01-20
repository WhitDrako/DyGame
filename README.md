# GPO Trading Platform

A professional web application for tracking and comparing Grand Piece Online item values. Built with React, TypeScript, Express, and SQLite.

## Features

- **User Authentication** - Secure login/registration system
- **Item Catalog** - Browse all GPO items with filters and search
- **Value History** - Interactive charts showing item value trends over time
- **Trade Comparator** - Compare trades to see if you're getting a WIN, FAIR, or LOSE deal
- **Admin Panel** - Full management of items, categories, and users
- **Ban System** - Complete access blocking for banned users

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- SQLite (better-sqlite3)
- JWT Authentication
- Multer for file uploads

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts for graphs
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DyGame
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Seed the database with sample data:
```bash
npm run seed
```

4. Start the development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Admin Access

To access the admin panel, log in with:
- **Username/Email:** whitedrako
- **Password:** Ziad1017

This account automatically has admin privileges.

## Project Structure

```
DyGame/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & validation
│   │   ├── models/         # Database setup
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   ├── index.ts        # Server entry point
│   │   └── seed.ts         # Database seeding
│   ├── data/               # SQLite database
│   └── uploads/            # Item images
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── public/             # Static assets
└── package.json            # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Items
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get single item with history
- `GET /api/items/:id/history` - Get item value history
- `POST /api/items` - Create item (admin)
- `PUT /api/items/:id` - Update item (admin)
- `DELETE /api/items/:id` - Delete item (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category with items
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user details
- `POST /api/users/:id/ban` - Ban user
- `POST /api/users/:id/unban` - Unban user
- `POST /api/users/:id/toggle-admin` - Toggle admin status
- `DELETE /api/users/:id` - Delete user

### Trade
- `POST /api/trade/compare` - Compare trade values
- `GET /api/trade/history` - Get user's trade history
- `GET /api/trade/cooldown` - Check cooldown status

## Design Theme

The application features a dark fantasy/pirate aesthetic inspired by One Piece and Grand Piece Online:
- Deep ocean blues and blacks
- Gold accents
- Clean modern UI with pirate RPG elements
- Smooth animations and transitions

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Admin-only endpoints
- Complete ban system (banned users cannot access any part of the site)

## Trade Comparator

The trade comparator tool:
- Allows selecting multiple items for each side
- Calculates total values
- Determines if trade is WIN (>10% profit), FAIR (within 10%), or LOSE (<10% loss)
- Has a 2-minute cooldown between comparisons

## License

Private project - All rights reserved.
