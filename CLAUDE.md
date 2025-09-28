# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kopik is a full-stack application with a React frontend and FastAPI backend, designed for intelligent inventory management with weather-sensitive recommendations and analytics.

## Architecture

### Frontend (`/Frontend`)
- **Framework**: React 19.1.1 with Vite for development
- **Routing**: React Router DOM for navigation
- **Styling**: Tailwind CSS with PostCSS
- **Charts**: Recharts for data visualization
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Structure**: 
  - `Layout.jsx` - Main application layout component
  - `Pages/` - Route components (Dashboard, Inventory, Weather, Analytics)
  - `src/components/` - Reusable UI components
  - `src/utils/` - Utility functions

### Backend (`/Backend`)
- **Framework**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite (`kopik.db`)
- **Models**: Pydantic models for API serialization
- **Key Files**:
  - `main.py` - FastAPI application entry point
  - `routes.py` - API endpoint definitions
  - `models.py` - Pydantic schemas and enums
  - `database.py` - SQLAlchemy database configuration
  - `populate_database.py` - Database seeding script

### Data Models
- **Intelligence Signals**: Social, Event, Economic, Calendar, Health, Environment categories
- **Inventory Items**: Multi-category inventory with weather sensitivity data
- **Recommendations**: AI-driven suggestions with priority levels and confidence scores

## Development Commands

### Frontend
```bash
cd Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
cd Backend
# Activate virtual environment
source venv/bin/activate  # or ./activate.sh

# Install dependencies
pip install -r requirements.txt

# Run the API server
python main.py       # Starts on http://localhost:8000

# Database operations
python setup_database.py     # Initialize database schema
python populate_database.py  # Seed database with sample data

# AI Agent Testing
python agents/test_enhanced_agent.py    # Test AI analysis system
python agents/quick_test.py             # Quick agent functionality test
```

### Important Development Notes
- **Port conflicts**: If port 8000 is in use, kill existing processes with `lsof -ti:8000 | xargs kill -9`
- **API endpoints**: Access Swagger docs at `http://localhost:8000/docs`
- **CORS enabled**: Frontend can connect from any origin
- **Database auto-creation**: SQLite database created automatically on first run

## API Structure

The backend provides RESTful endpoints under `/api` prefix:
- `/intelligence-signals/` - External data signals affecting inventory
- `/inventory-items/` - CRUD operations for inventory management
- `/recommendations/` - AI-generated business recommendations
- `/intelligence/dashboard` - Comprehensive dashboard analytics
- `/intelligence/analyze` - Trigger AI analysis and recommendation generation

### Critical API Flow
**Important**: The system uses a specific sequence for data updates:
1. **Add/Delete/Update inventory** → Automatically triggers `/intelligence/analyze`
2. **Analysis completes** → Frontend can then fetch fresh data from `/intelligence/dashboard`
3. **Frontend data refresh** → Updates all components with new AI insights

### AI Agent System
The backend includes an AI agent system (`/agents/`) that:
- Processes inventory data to generate intelligent recommendations
- Analyzes weather sensitivity and demand patterns
- Provides comprehensive business intelligence via `enhanced_agent.py`
- Auto-triggers analysis when inventory changes occur

## Data Flow Architecture

### Frontend State Management
- **DataContext**: Centralized React context for application state
- **Real-time API integration**: Fetches live data from backend APIs (no static JSON)
- **Priority-based sorting**: Recommendations sorted by priority (high/medium/low) and profit impact
- **Hybrid data sources**: Combines inventory, intelligence signals, and AI recommendations

### Backend Intelligence
- **Synchronous analysis**: Inventory operations wait for AI analysis completion
- **Database-driven**: SQLite with SQLAlchemy ORM for all data persistence
- **Pydantic v2**: Uses `from_attributes = True` (not legacy `orm_mode`)
- **Cross-system integration**: AI agents can access all database models

## Project Context

This is an intelligent inventory management system that incorporates external intelligence signals (weather, events, economic factors) to provide AI-driven recommendations for optimal inventory management. The system tracks weather sensitivity for different products and generates actionable insights for business operations.

The architecture emphasizes real-time AI analysis triggered by inventory changes, ensuring recommendations stay current with business operations.