# Redmine Client Dashboard Project

## Project Overview

This is a **Redmine Client Dashboard** application consisting of two main components:

1. **client-dashboard**: A React-based web application that provides a visual dashboard for managing and tracking Redmine issues with Gantt chart visualization.
2. **redmine-server**: An MCP (Model Context Protocol) server that acts as a bridge between AI assistants and the Redmine API.

The project is designed for a Korean development team (RSUPPORT) to visualize and manage Redmine tickets across multiple projects with features like Gantt charts, ticket grouping, and filtering.

## Technology Stack

### Frontend (client-dashboard)
- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **UI Components**: Lucide React (icons)
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Virtualization**: react-window (for performance)

### Backend (redmine-server)
- **Runtime**: Node.js with TypeScript
- **Protocol**: MCP (Model Context Protocol) SDK 0.5.0
- **HTTP Client**: Axios
- **Environment**: dotenv for configuration

### Debug Scripts
- Standalone Node.js scripts for testing Redmine API connectivity

## Project Structure

```
Redmine_Project_VScode/
├── client-dashboard/          # React frontend application
│   ├── src/
│   │   ├── App.tsx           # Main application component
│   │   ├── main.tsx          # Entry point
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── utils.ts          # Utility functions (grouping, status colors)
│   │   ├── api/
│   │   │   └── redmine.ts    # Redmine API client
│   │   ├── components/       # React components
│   │   │   ├── Sidebar.tsx   # Navigation sidebar
│   │   │   ├── TicketRow.tsx # Ticket list row component
│   │   │   ├── TicketHeader.tsx
│   │   │   ├── GanttGrid.tsx # Gantt chart visualization
│   │   │   ├── GanttBar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── ProjectFilter.tsx
│   │   │   ├── ColumnSelector.tsx
│   │   │   └── PartSelector.tsx
│   │   └── assets/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts        # Vite configuration with proxy
│   └── eslint.config.js
├── redmine-server/           # MCP server for Redmine API
│   ├── src/
│   │   └── index.ts          # MCP server implementation
│   ├── build/                # Compiled JavaScript output
│   ├── .env.local            # Environment variables (API keys)
│   ├── package.json
│   └── tsconfig.json
├── check_trackers.js         # Debug script for trackers
├── debug_projects_fetch.js   # Debug script for projects
├── list_projects.js          # Debug script to list projects
└── .gitignore
```

## Build and Development Commands

### client-dashboard

```bash
cd client-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

### redmine-server

```bash
cd redmine-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm run start

# Development mode with watch
npm run dev
```

## Configuration

### Environment Variables (redmine-server/.env.local)

```
REDMINE_URL=https://projects.rsupport.com
REDMINE_API_KEY=your_api_key_here
```

### Frontend Environment Variables (client-dashboard)

Create a `.env` file in `client-dashboard/`:

```
VITE_REDMINE_API_KEY=your_api_key_here
```

### Vite Proxy Configuration

The Vite dev server is configured to proxy `/redmine-api` requests to `https://projects.rsupport.com` to avoid CORS issues during development.

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- ES2022 target
- ESNext modules
- Explicit return types on exported functions

### React
- Functional components with hooks
- React.memo for performance optimization on list items
- Custom hooks for debouncing (see `useDebounce` in App.tsx)
- useTransition for non-urgent UI updates

### CSS/Styling
- Tailwind CSS utility classes
- Custom color schemes for status badges
- Responsive design with flexbox

### Naming Conventions
- Components: PascalCase (e.g., `TicketRow.tsx`)
- Utilities: camelCase (e.g., `groupTickets`)
- Types/Interfaces: PascalCase (e.g., `RedmineIssue`)
- Constants: UPPER_SNAKE_CASE for true constants

## Key Features

### Ticket Grouping
Tickets are grouped by parent-child relationships:
- Features (parent tickets without parents)
- Parts (child tickets belonging to a feature)

### Part Classification
Tickets are classified into parts based on:
1. Assignee name (hardcoded lists in `utils.ts`)
2. Category name
3. Tracker name

Parts include: BE (Backend), FE (Frontend), Plan, Design, QA, PM

### Gantt Chart
- Displays tickets on a timeline (±6 months from current date)
- Progress bars based on spent hours / estimated hours
- Color-coded by status
- Today indicator line

### Filters
- Project selection (multi-select)
- Part type filters (BE, FE, Plan, Design, QA)
- Column toggles (PIC, Deadline, Period)
- Search by ticket/subject
- Search by assignee

## Testing

No formal test suite is currently configured. Testing is done via:

1. Debug scripts in the root directory:
   - `check_trackers.js` - Test tracker API
   - `debug_projects_fetch.js` - Test project fetching
   - `list_projects.js` - List all projects

2. Manual testing through the development server

## Security Considerations

1. **API Keys**: Stored in `.env.local` (server) and `.env` (client), never committed to git
2. **CORS**: Development uses Vite proxy; production requires proper CORS configuration
3. **Authentication**: Uses Redmine API key authentication via `X-Redmine-API-Key` header
4. **Sensitive Data**: `.gitignore` excludes all `.env` files and local configuration

## Deployment

### Frontend
The frontend builds to `client-dashboard/dist/` as static files suitable for any static hosting.

### MCP Server
The redmine-server builds to `redmine-server/build/` and can be run with Node.js:

```bash
node build/index.js
```

## Notes for AI Agents

1. **Korean Language**: The UI includes Korean text (e.g., "담당자" for assignee) and status names are matched against Korean terms (신규, 진행, 해결, etc.).

2. **Hardcoded Project Names**: The Sidebar component contains hardcoded project names specific to RSUPPORT's Redmine instance (RVS 1.0, RVS 1.5, RVS 2.0, 농협은행, etc.).

3. **Team Member Lists**: `utils.ts` contains hardcoded lists of team members classified by role (FE_MEMBERS, BE_MEMBERS, PLAN_DESIGN_MEMBERS).

4. **Date Filtering**: The API client fetches only issues updated within the last 2 months for performance.

5. **Performance Optimizations**:
   - Debounced search inputs (300ms)
   - useMemo for expensive calculations
   - useTransition for non-urgent updates
   - React.memo for component memoization
