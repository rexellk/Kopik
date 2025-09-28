# GEMINI.md

This file provides guidance to Gemini when working with code in this repository.

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
npm install
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
```

## API Structure

The backend provides RESTful endpoints under `/api` prefix:
- `/intelligence-signals/` - External data signals affecting inventory
- `/inventory-items/` - CRUD operations for inventory management
- `/recommendations/` - AI-generated business recommendations

Key features:
- Weather sensitivity tracking for inventory items
- Low stock monitoring with automated reorder points
- High-priority recommendation filtering
- Comprehensive CRUD operations with validation

## Project Context

This is an intelligent inventory management system that incorporates external intelligence signals (weather, events, economic factors) to provide AI-driven recommendations for optimal inventory management. The system tracks weather sensitivity for different products and generates actionable insights for business operations.
