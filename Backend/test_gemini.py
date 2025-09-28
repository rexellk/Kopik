#!/usr/bin/env python3
"""
Test script for Gemini LLM integration
"""

import os
import sys
from dotenv import load_dotenv
load_dotenv()

def test_gemini_api():
    """Test basic Gemini API connection"""
    print("🧪 Testing Gemini API Connection")
    print("=" * 50)

    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key or api_key == 'your_gemini_api_key_here':
        print("❌ GOOGLE_API_KEY not set or still placeholder")
        print("📋 Steps to get FREE Gemini API key:")
        print("   1. Go to: https://aistudio.google.com/app/apikey")
        print("   2. Sign in with Google account")
        print("   3. Click 'Create API Key'")
        print("   4. Copy the key (starts with 'AIza...')")
        print("   5. Update .env file: GOOGLE_API_KEY=your_actual_key")
        return False

    print(f"✅ API Key found: {api_key[:10]}...")

    try:
        import google.generativeai as genai

        # Configure and test
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Simple test
        response = model.generate_content("Say 'Hello from Gemini!' in exactly 3 words")
        print(f"🎉 Gemini Response: {response.text}")

        return True

    except Exception as e:
        print(f"❌ Gemini test failed: {str(e)}")
        return False

def test_llm_summary_service():
    """Test the updated LLM summary service"""
    print(f"\n🤖 Testing LLM Summary Service with Gemini")
    print("=" * 50)

    try:
        from llm_summary import llm_service

        # Test data
        test_alerts = [
            {
                "type": "low_stock",
                "message": "Low stock: Flour (2 units remaining)",
                "priority": "high",
                "category": "inventory"
            },
            {
                "type": "upcoming_event",
                "message": "Summer Music Festival in 2 days (2500 expected)",
                "priority": "high",
                "category": "demand"
            }
        ]

        test_solutions = [
            {
                "description": "Reorder Flour immediately or source from alternative supplier",
                "confidence": 95.0,
                "profit_impact": 150.0
            },
            {
                "description": "Increase inventory by 100% for Summer Music Festival",
                "confidence": 85.0,
                "profit_impact": 22500.0
            }
        ]

        test_data_overview = {
            "low_stock_items": 2,
            "recent_waste_records": 5,
            "upcoming_events": 2,
            "pending_orders": 1
        }

        # Generate summary
        summary = llm_service.generate_business_summary(test_alerts, test_solutions, test_data_overview)

        print(f"✅ Gemini LLM Summary Generated:")
        print(f"📝 {summary}")
        print(f"\n🎯 SUCCESS: LLM summary service working with Gemini!")

        return True

    except Exception as e:
        print(f"❌ LLM Summary test failed: {str(e)}")
        return False

def test_enhanced_agent():
    """Test the enhanced agent with Gemini"""
    print(f"\n🚀 Testing Enhanced Agent with Gemini")
    print("=" * 50)

    try:
        sys.path.append('agents')
        from enhanced_agent import EnhancedKopikAgent

        agent = EnhancedKopikAgent()
        success = agent.run_comprehensive_analysis()

        if success:
            print(f"✅ Enhanced Agent completed successfully")
            if hasattr(agent, 'last_summary'):
                print(f"📝 Generated Summary: {agent.last_summary}")
        else:
            print(f"❌ Enhanced Agent failed")

        return success

    except Exception as e:
        print(f"❌ Enhanced Agent test failed: {str(e)}")
        return False

def main():
    """Run all Gemini tests"""
    print("🚀 Kopik Gemini LLM Integration Tests")
    print("=" * 60)

    tests = [
        ("Gemini API Connection", test_gemini_api),
        ("LLM Summary Service", test_llm_summary_service),
        ("Enhanced Agent", test_enhanced_agent)
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
        print("🎉 All tests passed! Gemini LLM integration is working!")
    else:
        print("⚠️ Some tests failed. If GOOGLE_API_KEY test failed, get your free API key first.")

if __name__ == "__main__":
    main()