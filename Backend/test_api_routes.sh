#!/bin/bash

echo "🚀 Testing Kopik Intelligence API Routes"
echo "=" * 50

# Check if server is running
if ! curl -s http://localhost:8000 > /dev/null; then
    echo "❌ FastAPI server not running on localhost:8000"
    echo "💡 Start it with: python main.py"
    exit 1
fi

echo "✅ Server is running"

# Test 1: Trigger Analysis
echo -e "\n🧪 Test 1: POST /api/intelligence/analyze"
echo "Command: curl -X POST http://localhost:8000/api/intelligence/analyze"
echo "Response:"
curl -s -X POST http://localhost:8000/api/intelligence/analyze | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'   Success: {data.get(\"success\", \"N/A\")}')
    print(f'   Message: {data.get(\"message\", \"N/A\")}')
    print(f'   Timestamp: {data.get(\"timestamp\", \"N/A\")}')
    print(f'   Analysis Count: {data.get(\"analysis_count\", \"N/A\")}')
except:
    print('   Error parsing JSON response')
"

# Test 2: Get Dashboard
echo -e "\n🧪 Test 2: GET /api/intelligence/dashboard"
echo "Command: curl http://localhost:8000/api/intelligence/dashboard"
echo "Response Summary:"
curl -s http://localhost:8000/api/intelligence/dashboard | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success'):
        summary = data.get('summary', {})
        print(f'   Success: {data.get(\"success\")}')
        print(f'   Total Alerts: {summary.get(\"total_alerts\", 0)}')
        print(f'   High Priority: {summary.get(\"high_priority_alerts\", 0)}')
        print(f'   Recommendations: {summary.get(\"total_recommendations\", 0)}')
        print(f'   Profit Impact: \${summary.get(\"total_profit_impact\", 0):,.2f}')

        alerts = data.get('alerts', [])
        if alerts:
            print(f'\\n   Sample Alert: {alerts[0].get(\"message\", \"\")}')
    else:
        print(f'   Error: {data.get(\"detail\", \"Unknown error\")}')
except Exception as e:
    print(f'   Error parsing response: {e}')
"

echo -e "\n✅ API testing complete!"