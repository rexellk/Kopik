#!/usr/bin/env python3
"""
Direct test of the agent API functionality
"""

import sys
import os
from datetime import datetime

# Add current directory to path for proper imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from agents.enhanced_agent import EnhancedKopikAgent
    from models import Priority

    print("🧪 Testing Direct Agent API Integration...")

    # Create agent
    agent = EnhancedKopikAgent()

    # Get data
    data = agent.fetch_comprehensive_data()

    # Run basic analysis
    inventory_alerts, inventory_solutions = agent.analyze_inventory(data['inventory'])
    order_alerts, order_solutions = agent.analyze_orders(data['orders'])

    # Create simple JSON response
    response = {
        "success": True,
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_alerts": len(inventory_alerts) + len(order_alerts),
            "total_recommendations": len(inventory_solutions) + len(order_solutions),
            "total_profit_impact": sum(s.get('profit_impact', 0) for s in inventory_solutions + order_solutions)
        },
        "alerts": [
            {
                "type": alert["type"],
                "message": alert["message"],
                "priority": str(alert["priority"])
            }
            for alert in inventory_alerts + order_alerts
        ],
        "recommendations": [
            {
                "description": sol["description"],
                "confidence": round(sol["confidence"], 1),
                "profit_impact": round(sol.get("profit_impact", 0), 2)
            }
            for sol in inventory_solutions + order_solutions
        ]
    }

    print("✅ Successfully generated response:")
    print(f"   - Success: {response['success']}")
    print(f"   - Alerts: {response['summary']['total_alerts']}")
    print(f"   - Recommendations: {response['summary']['total_recommendations']}")
    print(f"   - Profit Impact: ${response['summary']['total_profit_impact']:,.2f}")

    # Show sample data
    print(f"\n📋 Sample Alerts:")
    for alert in response["alerts"][:2]:
        print(f"   - [{alert['priority']}] {alert['message']}")

    print(f"\n💡 Sample Recommendations:")
    for rec in response["recommendations"][:2]:
        print(f"   - {rec['description'][:50]}... (${rec['profit_impact']:.2f})")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()