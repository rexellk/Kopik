#!/usr/bin/env python3
"""
Test script for LLM summary integration
"""

import os
import sys
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_llm_summary_service():
    """Test the LLM summary service directly"""
    print("🧪 Testing LLM Summary Service")
    print("=" * 50)

    try:
        from llm_summary import llm_service

        # Sample test data
        test_alerts = [
            {
                "type": "low_stock",
                "message": "Low stock: Flour (2 units remaining)",
                "priority": "high",
                "category": "inventory"
            },
            {
                "type": "weather_opportunity",
                "message": "Rainy weather expected: 80% precipitation chance",
                "priority": "medium",
                "category": "weather"
            }
        ]

        test_solutions = [
            {
                "description": "Reorder Flour immediately or source from alternative supplier",
                "confidence": 95.0,
                "profit_impact": 150.0
            },
            {
                "description": "Increase hot beverage inventory and comfort food options",
                "confidence": 75.0,
                "profit_impact": 200.0
            }
        ]

        test_data_overview = {
            "low_stock_items": 3,
            "recent_waste_records": 5,
            "upcoming_events": 2,
            "pending_orders": 1
        }

        # Generate summary
        summary = llm_service.generate_business_summary(test_alerts, test_solutions, test_data_overview)

        print(f"✅ LLM Summary Generated:")
        print(f"   {summary}")
        print(f"\n📊 Test completed successfully!")

        return True

    except Exception as e:
        print(f"❌ LLM Summary test failed: {e}")
        return False

def test_enhanced_agent_with_summary():
    """Test the enhanced agent with summary generation"""
    print(f"\n🤖 Testing Enhanced Agent with LLM Summary")
    print("=" * 50)

    try:
        from agents.enhanced_agent import EnhancedKopikAgent

        # Create agent
        agent = EnhancedKopikAgent()

        # Run analysis (this will generate summary)
        success = agent.run_comprehensive_analysis()

        if success and hasattr(agent, 'last_summary') and agent.last_summary:
            print(f"✅ Enhanced Agent with LLM Summary:")
            print(f"   Summary: {agent.last_summary}")
            print(f"   Timestamp: {agent.last_analysis_data.get('timestamp', 'N/A')}")
        else:
            print(f"⚠️ Agent ran but no summary generated")

        return success

    except Exception as e:
        print(f"❌ Enhanced Agent test failed: {e}")
        return False

def test_api_endpoint():
    """Test the API endpoint with summary"""
    print(f"\n🌐 Testing API Endpoint with LLM Summary")
    print("=" * 50)

    try:
        import requests
        import json

        # Test the intelligence dashboard endpoint
        response = requests.get("http://localhost:8000/api/intelligence/dashboard")

        if response.status_code == 200:
            data = response.json()

            print(f"✅ API Response received:")
            print(f"   Success: {data.get('success', False)}")
            print(f"   Summary: {data.get('summary', 'No summary')}")
            print(f"   Alerts: {data.get('metrics', {}).get('total_alerts', 0)}")
            print(f"   Profit Impact: ${data.get('metrics', {}).get('total_profit_impact', 0)}")

            return True
        else:
            print(f"❌ API request failed: {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"⚠️ API server not running. Start the backend with 'python main.py'")
        return False
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Kopik LLM Summary Integration Tests")
    print("=" * 60)

    # Check for OpenAI API key
    if not os.getenv('OPENAI_API_KEY'):
        print("⚠️ WARNING: OPENAI_API_KEY not set. LLM features will use fallback summaries.")
        print("   Set your API key: export OPENAI_API_KEY='your-key-here'")
        print()

    # Run tests
    tests = [
        ("LLM Summary Service", test_llm_summary_service),
        ("Enhanced Agent with Summary", test_enhanced_agent_with_summary),
        ("API Endpoint", test_api_endpoint)
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))

    # Summary
    print(f"\n📋 Test Results Summary:")
    print("=" * 30)
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {test_name}: {status}")

    passed_count = sum(1 for _, passed in results if passed)
    print(f"\n🎯 {passed_count}/{len(results)} tests passed")

    if passed_count == len(results):
        print("🎉 All tests passed! LLM summary integration is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()