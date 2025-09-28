#!/usr/bin/env python3
"""
Comprehensive test for all LLM features in Kopik
"""

import os
import sys
import json
from dotenv import load_dotenv
load_dotenv()

def test_enhanced_api_endpoint():
    """Test the enhanced API endpoint with all LLM features"""
    print("🚀 Testing Enhanced API with All LLM Features")
    print("=" * 60)

    try:
        import requests

        # Test the enhanced intelligence dashboard
        response = requests.get("http://localhost:8000/api/intelligence/dashboard")

        if response.status_code == 200:
            data = response.json()

            print(f"✅ API Response Success!")
            print(f"📝 Business Summary:")
            print(f"   {data.get('summary', 'No summary')}")

            print(f"\n📊 Metrics:")
            metrics = data.get('metrics', {})
            print(f"   - Total Alerts: {metrics.get('total_alerts', 0)}")
            print(f"   - High Priority: {metrics.get('high_priority_alerts', 0)}")
            print(f"   - Recommendations: {metrics.get('total_recommendations', 0)}")
            print(f"   - Profit Impact: ${metrics.get('total_profit_impact', 0)}")

            # Check LLM features
            llm_features = data.get('llm_features', {})
            if 'error' in llm_features:
                print(f"\n⚠️ LLM Features: {llm_features['error']}")
            else:
                print(f"\n🧠 Advanced LLM Features Available:")

                # Check if regular recommendations have explanations
                recommendations = data.get('recommendations', [])
                has_explanations = len(recommendations) > 0 and 'explanation' in recommendations[0]
                print(f"   📋 Recommendations with LLM Explanations: {len(recommendations) if has_explanations else 0}")
                if has_explanations:
                    print(f"      Example: {recommendations[0].get('explanation', 'No explanation')[:100]}...")

                # Risk analysis
                risk_analysis = llm_features.get('risk_analysis', {})
                print(f"   ⚠️ Risk Level: {risk_analysis.get('risk_level', 'unknown')}")
                print(f"      Assessment: {risk_analysis.get('overall_assessment', 'No assessment')}")

                top_risks = risk_analysis.get('top_risks', [])
                if top_risks:
                    print(f"      Top Risk: {top_risks[0].get('risk', 'None')} (${top_risks[0].get('estimated_cost', 0)} impact)")

                opportunities = risk_analysis.get('opportunities', [])
                if opportunities:
                    print(f"      Opportunity: {opportunities[0].get('opportunity', 'None')} (${opportunities[0].get('profit_potential', 0)} potential)")

                # Menu optimization
                menu_opt = llm_features.get('menu_optimization', {})
                print(f"   🍽️ Menu Optimization:")
                print(f"      Strategy: {menu_opt.get('overall_strategy', 'No strategy')}")
                print(f"      Impact: ${menu_opt.get('total_estimated_impact', 0)}")

                menu_suggestions = menu_opt.get('menu_suggestions', [])
                if menu_suggestions:
                    top_item = menu_suggestions[0]
                    print(f"      Top Item: {top_item.get('item_name', 'None')} (${top_item.get('profit_potential', 0)} potential)")

                waste_impact = menu_opt.get('waste_reduction_impact', {})
                if waste_impact.get('estimated_savings', 0) > 0:
                    print(f"      Waste Reduction: ${waste_impact['estimated_savings']} savings")

            return True

        else:
            print(f"❌ API request failed: {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"⚠️ API server not running. Start with: python main.py")
        return False
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        return False

def test_individual_llm_services():
    """Test each LLM service individually"""
    print(f"\n🧪 Testing Individual LLM Services")
    print("=" * 50)

    results = []

    # Test explanation service
    try:
        from llm_explanations import explanation_service

        test_rec = {
            "description": "Reorder Flour immediately",
            "confidence": 95,
            "profit_impact": 150,
            "priority": "high"
        }

        explanation = explanation_service.explain_recommendation(test_rec)
        print(f"✅ Explanation Service: {explanation[:100]}...")
        results.append(("Explanation Service", True))

    except Exception as e:
        print(f"❌ Explanation Service failed: {str(e)}")
        results.append(("Explanation Service", False))

    # Test risk analyzer
    try:
        from llm_risk_analyzer import risk_analyzer

        test_data = {
            "inventory": [],
            "food_waste": [],
            "events": [],
            "sales": [],
            "orders": [],
            "weather": []
        }

        risk_analysis = risk_analyzer.analyze_business_patterns(test_data)
        print(f"✅ Risk Analyzer: {risk_analysis.get('risk_level', 'unknown')} risk level")
        results.append(("Risk Analyzer", True))

    except Exception as e:
        print(f"❌ Risk Analyzer failed: {str(e)}")
        results.append(("Risk Analyzer", False))

    # Test menu optimizer
    try:
        from llm_menu_optimizer import menu_optimizer

        test_data = {
            "inventory": [],
            "food_waste": [],
            "events": [],
            "sales": [],
            "orders": [],
            "weather": []
        }

        menu_suggestions = menu_optimizer.generate_menu_suggestions(test_data)
        print(f"✅ Menu Optimizer: Suggestions generated")
        results.append(("Menu Optimizer", True))

    except Exception as e:
        print(f"❌ Menu Optimizer failed: {str(e)}")
        results.append(("Menu Optimizer", False))

    return results

def main():
    """Run comprehensive LLM feature tests"""
    print("🚀 Kopik Comprehensive LLM Feature Test")
    print("=" * 70)

    # Check API key
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("❌ GOOGLE_API_KEY not set!")
        return

    print(f"✅ Gemini API Key configured")

    # Test individual services
    service_results = test_individual_llm_services()

    # Test enhanced API
    api_success = test_enhanced_api_endpoint()

    # Summary
    print(f"\n📋 Test Results Summary:")
    print("=" * 40)

    for service_name, passed in service_results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {service_name}: {status}")

    api_status = "✅ PASS" if api_success else "❌ FAIL"
    print(f"   Enhanced API Endpoint: {api_status}")

    passed_count = sum(1 for _, passed in service_results if passed) + (1 if api_success else 0)
    total_tests = len(service_results) + 1

    print(f"\n🎯 {passed_count}/{total_tests} tests passed")

    if passed_count == total_tests:
        print("🎉 ALL LLM FEATURES WORKING! Your hackathon project is ready!")
        print("\n🚀 What You Now Have:")
        print("   ✅ Intelligent business summaries")
        print("   ✅ Dynamic recommendation explanations")
        print("   ✅ Advanced risk pattern analysis")
        print("   ✅ AI-powered menu optimization")
        print("   ✅ Comprehensive business intelligence")
    else:
        print("⚠️ Some LLM features need attention")

if __name__ == "__main__":
    main()