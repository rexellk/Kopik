# Kopik AI Agent Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
cd Backend
pip install -r requirements.txt
```

### 2. Run Quick Test
```bash
python agents/quick_test.py
```

### 3. Run Full Test Suite
```bash
python agents/test_agent.py
```

## Step-by-Step Testing Process

### Step 1: Environment Setup

1. **Install dependencies**:
   ```bash
   cd Backend
   source venv/bin/activate  # or ./activate.sh
   pip install -r requirements.txt
   ```

2. **Set up database** (if not done already):
   ```bash
   python setup_database.py
   python populate_database.py  # Optional: adds sample data
   ```

### Step 2: Basic Validation

Run the quick test to ensure everything is set up correctly:
```bash
python agents/quick_test.py
```

This checks:
- ✅ Required packages (uagents, requests)
- ✅ Database connection
- ✅ Existing data in database

### Step 3: Full Agent Testing

Run the comprehensive test suite:
```bash
python agents/test_agent.py
```

This will:
1. **Set up test data** - Creates inventory items, intelligence signals, and recommendations
2. **Test database connection** - Verifies all database operations work
3. **Test API endpoints** - Checks if your FastAPI server is running (optional)
4. **Test agent communication** - Validates agent imports and setup
5. **Run manual analysis** - Tests the core agent logic

### Step 4: Live Agent Testing

#### Option A: Database Mode (Recommended for testing)
```bash
# Terminal 1: Start the intelligence agent
python agents/run_agent.py agent

# Terminal 2: Trigger analysis
python agents/run_agent.py analyze
```

#### Option B: API Mode (Requires FastAPI server)
```bash
# Terminal 1: Start FastAPI server
python main.py

# Terminal 2: Start the intelligence agent
python agents/run_agent.py agent

# Terminal 3: Trigger analysis with API mode
python agents/run_agent.py analyze --api
```

#### Option C: Full Agent System
```bash
# Terminal 1: Start FastAPI server (optional)
python main.py

# Terminal 2: Run both intelligence and client agents
python agents/run_agent.py both
```

## Testing Scenarios

### Scenario 1: Low Stock Detection
The agent should detect and alert on:
- Items where `current_stock <= reorder_point`
- Generate reorder recommendations
- Calculate profit impact

### Scenario 2: Intelligence Signal Processing
The agent should process:
- **Weather signals**: Recommend inventory adjustments
- **Event signals**: Suggest capacity increases
- **Economic signals**: Propose pricing strategies

### Scenario 3: Recommendation Generation
The agent should:
- Create new recommendations in the database
- Set appropriate priority levels
- Include confidence scores and profit impact

## Troubleshooting

### Common Issues

1. **Import Error: uagents not found**
   ```bash
   pip install uagents==0.12.0
   ```

2. **Database connection failed**
   - Check if `kopik.db` exists in Backend directory
   - Run `python setup_database.py`

3. **API endpoints not working**
   - Make sure FastAPI server is running: `python main.py`
   - Check server is on `http://localhost:8000`

4. **Agent won't start**
   - Check port 8001 is available
   - Look for Python path issues

### Debug Mode

Add debug logging to see what the agent is doing:
```python
# In intelligence_agent.py, add at the top:
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Validation Checklist

- [ ] Dependencies installed successfully
- [ ] Database connection works
- [ ] Test data can be created and queried
- [ ] Agent imports work without errors
- [ ] Manual analysis generates alerts and solutions
- [ ] Agent can start and run
- [ ] Agent processes low stock items
- [ ] Agent processes intelligence signals
- [ ] Agent creates recommendations in database
- [ ] Periodic analysis runs every 5 minutes

## Expected Output

When working correctly, you should see:
1. **Alerts** for low stock items and important signals
2. **Solutions** with confidence scores and profit impact
3. **New recommendations** stored in the database
4. **Periodic analysis** running every 5 minutes

## Performance Notes

- Analysis typically takes 1-3 seconds
- Agent uses minimal resources (runs on port 8001)
- Database queries are optimized for low stock and recent signals
- Can process hundreds of inventory items efficiently