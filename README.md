# FuelEU Maritime Compliance Management System

A comprehensive full-stack application for managing maritime routes, compliance balance (CB), banking, and pooling under the FuelEU Maritime regulation.

## 🚀 Features

### 1. **Routes Management**
- View all maritime routes with detailed compliance data
- Real-time compliance status indicators (Compliant/Non-Compliant)
- Filter routes by year and search by vessel or route name
- Set baseline routes for comparison analysis
- Display key metrics: distance, fuel consumption, GHG intensity, and compliance balance

### 2. **Route Comparison**
- Compare baseline route against any other route
- Side-by-side visualization of performance metrics
- Percentage change indicators for all parameters
- Compliance status comparison
- Color-coded improvements/regressions

### 3. **Banking Operations**
- View and manage compliance balance banking records
- Bank surplus CB for future use
- Apply previously banked CB to cover deficits
- Real-time balance calculations
- Summary statistics (Total Banked, Total Applied, Total Remaining)
- Visual status indicators for surplus/deficit vessels

### 4. **Pooling Management**
- Create compliance pools for vessel collaboration
- Add vessels to pools with their CB contributions
- Automatic calculation of pool totals and averages
- Before/After pool status visualization
- Identify status changes (vessels becoming compliant through pooling)
- Multi-pool support with member management

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - High-quality UI components
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **Drizzle ORM** - Type-safe database operations
- **Turso (LibSQL)** - Serverless SQLite database

### Architecture
- **Hexagonal Architecture** principles
- Clean separation of concerns
- RESTful API design
- Client-side state management
- Local storage for baseline persistence

## 📊 Database Schema

### Routes
- Route details (name, vessel, distance, fuel consumption)
- GHG intensity metrics
- Compliance balance calculations
- Year tracking

### Banking Records
- Vessel-specific banking data
- Banked, applied, and remaining CB
- Historical records by year

### Pools
- Pool metadata and creation tracking
- Support for multiple compliance pools

### Pool Members
- Vessel contributions to pools
- Pool membership tracking
- CB contribution amounts

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Environment variables configured (see `.env` file)

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

The application uses Turso database. Required environment variables:

```env
TURSO_CONNECTION_URL=your_turso_connection_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

## 📡 API Endpoints

### Routes API (`/api/routes`)
- `GET /api/routes` - List all routes (supports pagination, search, year filter)
- `GET /api/routes?id=[id]` - Get single route
- `POST /api/routes` - Create new route
- `PUT /api/routes?id=[id]` - Update route
- `DELETE /api/routes?id=[id]` - Delete route

### Banking Records API (`/api/banking-records`)
- `GET /api/banking-records` - List all records (supports pagination, filtering)
- `GET /api/banking-records?id=[id]` - Get single record
- `POST /api/banking-records` - Create new record
- `PUT /api/banking-records?id=[id]` - Update record
- `DELETE /api/banking-records?id=[id]` - Delete record

### Pools API (`/api/pools`)
- `GET /api/pools` - List all pools
- `GET /api/pools?id=[id]` - Get single pool
- `POST /api/pools` - Create new pool
- `PUT /api/pools?id=[id]` - Update pool
- `DELETE /api/pools?id=[id]` - Delete pool

### Pool Members API (`/api/pool-members`)
- `GET /api/pool-members` - List all members (supports pool filtering)
- `GET /api/pool-members?id=[id]` - Get single member
- `POST /api/pool-members` - Add member to pool
- `PUT /api/pool-members?id=[id]` - Update member
- `DELETE /api/pool-members?id=[id]` - Remove member

## 🎯 Core Functionality

### Compliance Balance Calculation

The compliance balance (CB) is calculated using the formula:

```
CB = (reference_ghg_intensity - actual_ghg_intensity) × fuel_consumed_mt × distance_nm / 1000
```

- **Positive CB**: Route is compliant (lower emissions than reference)
- **Negative CB**: Route is non-compliant (higher emissions than reference)

### Banking Rules
1. Vessels can bank surplus CB for up to 2 years
2. Banked CB can be applied to future deficits
3. Cannot bank more than remaining positive CB
4. Cannot apply more than currently banked amount

### Pooling Rules
1. Multiple vessels can form compliance pools
2. Pool CB = Sum of all member contributions
3. Average CB per vessel = Total Pool CB / Number of members
4. Pooling can help non-compliant vessels achieve compliance through collective balance

## 📱 Responsive Design

- Mobile-first approach
- Responsive tables with horizontal scrolling
- Adaptive navigation (icons-only on mobile)
- Touch-friendly interactions
- Dark mode support

## 🛠️ Development

### Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── routes/
│   │   │   ├── banking-records/
│   │   │   ├── pools/
│   │   │   └── pool-members/
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main page with tabs
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── RoutesTab.tsx
│   │   ├── CompareTab.tsx
│   │   ├── BankingTab.tsx
│   │   └── PoolingTab.tsx
│   ├── db/
│   │   ├── index.ts         # Database connection
│   │   ├── schema.ts        # Drizzle schema
│   │   └── seeds/           # Database seeders
│   └── types/
│       └── index.ts         # TypeScript types
├── README.md
├── AGENT_WORKFLOW.md        # AI agent workflow documentation
└── REFLECTION.md            # Project reflection
```

## 🎨 UI/UX Highlights

- **Intuitive Tab Navigation**: Four main sections easily accessible
- **Color-Coded Status**: Green for compliant, red for non-compliant
- **Real-Time Calculations**: Instant feedback on banking/pooling operations
- **Comprehensive Tables**: Sortable, filterable data views
- **Interactive Dialogs**: Modal forms for data entry
- **Toast Notifications**: User feedback for all actions
- **Gradient Accents**: Modern visual design

## 🔒 Data Validation

- Client-side form validation
- Server-side input sanitization
- Type-safe database operations
- Error handling with user-friendly messages
- Optimistic UI updates

## 📈 Future Enhancements

- Historical trend analysis
- Export data to CSV/PDF
- Advanced filtering and sorting
- Multi-year compliance projections
- Automated compliance recommendations
- Email notifications for non-compliance
- Admin dashboard with analytics
- User authentication and authorization
- Audit logging

## 📄 License

This project is part of a technical assessment and is provided as-is for evaluation purposes.

## 👨‍💻 Author

Full-Stack Developer Assignment for FuelEU Maritime Compliance System

---

**Note**: This application uses seeded sample data for demonstration purposes. All vessel names, routes, and compliance values are fictional and for testing only.