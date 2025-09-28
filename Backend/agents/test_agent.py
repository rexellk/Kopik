#!/usr/bin/env python3
"""
Test script for the Kopik Intelligence Agent
This script will test the agent functionality step by step
"""

import asyncio
import sys
import os
import time
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, InventoryItem, IntelligenceSignal, Recommendation
from models import InventoryCategory, SignalCategory, Priority, RecommendationCategory
import requests

def setup_test_data():
    """Set up test data in the database"""
    print("Setting up test data...")

    db = SessionLocal()
    try:
        # Clear existing test data
        db.query(InventoryItem).filter(InventoryItem.name.like("Test%")).delete()
        db.query(IntelligenceSignal).filter(IntelligenceSignal.name.like("Test%")).delete()
        db.query(Recommendation).filter(Recommendation.title.like("Test%")).delete()

        # Add test inventory items with low stock
        test_items = [
            InventoryItem(
                item_id="test_001",
                name="Test Coffee Beans",
                category=InventoryCategory.BEVERAGES,
                current_stock=2.0,  # Low stock
                unit="kg",
                reorder_point=5.0,
                daily_usage=1.5,
                cost_per_unit=25.99,
                supplier="Test Coffee Co"
            ),
            InventoryItem(
                item_id="test_002",
                name="Test Milk",
                category=InventoryCategory.DAIRY,
                current_stock=0.5,  # Very low stock
                unit="L",
                reorder_point=2.0,
                daily_usage=10.0,
                cost_per_unit=4.99,
                supplier="Local Dairy"
            ),
            InventoryItem(
                item_id="test_003",
                name="Test Pastries",
                category=InventoryCategory.BAKING,
                current_stock=20.0,  # Good stock
                unit="pieces",
                reorder_point=10.0,
                daily_usage=15.0,
                cost_per_unit=2.50,
                supplier="Bakery Supply"
            )
        ]

        # Add test intelligence signals
        test_signals = [
            IntelligenceSignal(
                name="Test Rainy Weather",
                category=SignalCategory.ENVIRONMENT,
                impact_description="Heavy rain expected, customers prefer warm beverages",
                impact_value=25.0,
                active_date=datetime.now() + timedelta(hours=2)
            ),
            IntelligenceSignal(
                name="Test Local Event",
                category=SignalCategory.EVENT,
                impact_description="Music festival nearby, expect 500+ additional customers",
                impact_value=75.0,
                details={"expected_attendance": 500, "event_type": "music_festival"},
                active_date=datetime.now()
            ),
            IntelligenceSignal(
                name="Test Economic Signal",
                category=SignalCategory.ECONOMIC,
                impact_description="Coffee bean prices rising due to supply chain issues",
                impact_value=15.0
            )
        ]

        # Add test recommendation
        test_recommendation = Recommendation(
            priority=Priority.HIGH,
            title="Test High Priority Action",
            description="This is a test high-priority recommendation",
            confidence=85.0,
            profit_impact=200.0,
            action_required=True,
            category=RecommendationCategory.INVENTORY
        )

        # Add all to database
        for item in test_items:
            db.add(item)
        for signal in test_signals:
            db.add(signal)
        db.add(test_recommendation)

        db.commit()
        print(f"✅ Test data created successfully!")
        print(f"   - {len(test_items)} inventory items")
        print(f"   - {len(test_signals)} intelligence signals")
        print(f"   - 1 recommendation")

    except Exception as e:
        print(f"❌ Error setting up test data: {e}")
        db.rollback()
    finally:
        db.close()

def test_database_connection():
    """Test if database connection works"""
    print("\n🔍 Testing database connection...")

    db = SessionLocal()
    try:
        # Test basic queries
        inventory_count = db.query(InventoryItem).count()
        signals_count = db.query(IntelligenceSignal).count()
        recommendations_count = db.query(Recommendation).count()

        print(f"✅ Database connection successful!")
        print(f"   - Inventory items: {inventory_count}")
        print(f"   - Intelligence signals: {signals_count}")
        print(f"   - Recommendations: {recommendations_count}")

        # Test low stock query (what the agent uses)
        low_stock = db.query(InventoryItem).filter(
            InventoryItem.current_stock <= InventoryItem.reorder_point
        ).count()
        print(f"   - Low stock items: {low_stock}")

        return True

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    finally:
        db.close()

def test_api_endpoints():
    """Test if API endpoints are working"""
    print("\n🌐 Testing API endpoints...")

    base_url = "http://localhost:8000"
    endpoints = [
        "/api/inventory-items/low-stock/",
        "/api/intelligence-signals/",
        "/api/recommendations/high-priority/"
    ]

    all_working = True

    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {endpoint} - {len(data)} items")
            else:
                print(f"⚠️  {endpoint} - Status {response.status_code}")
                all_working = False
        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint} - API server not running")
            all_working = False
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")
            all_working = False

    return all_working

async def test_agent_communication():
    """Test agent communication"""
    print("\n🤖 Testing agent communication...")

    try:
        from intelligence_agent import AnalysisRequest, intelligence_agent
        from agent_client import client_agent, request_analysis

        print("✅ Agent modules imported successfully")

        # Test creating analysis request
        request = AnalysisRequest(use_api=False)
        print(f"✅ Analysis request created: {request}")

        return True

    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Agent communication error: {e}")
        return False

def run_manual_analysis():
    """Run a manual analysis to test the logic"""
    print("\n📊 Running manual analysis test...")

    try:
        # Import the processing functions
        sys.path.append(os.path.join(os.path.dirname(__file__)))
        from intelligence_agent import fetch_from_database, process_inventory, process_intelligence_signals

        # Fetch data
        data = asyncio.run(fetch_from_database())
        print(f"✅ Data fetched: {len(data.get('inventory', []))} inventory, {len(data.get('intelligence_signals', []))} signals")

        # Process data manually
        alerts = []
        solutions = []

        # Create a mock context for testing
        class MockContext:
            def __init__(self):
                self.logger = MockLogger()

        class MockLogger:
            def info(self, msg): print(f"ℹ️  {msg}")
            def error(self, msg): print(f"❌ {msg}")

        ctx = MockContext()

        asyncio.run(process_inventory(data.get('inventory', []), alerts, solutions, ctx))
        asyncio.run(process_intelligence_signals(data.get('intelligence_signals', []), alerts, solutions, ctx))

        print(f"✅ Processing complete:")
        print(f"   - {len(alerts)} alerts generated")
        print(f"   - {len(solutions)} solutions generated")

        # Show sample results
        if alerts:
            print(f"\n📢 Sample Alert: {alerts[0].message}")
        if solutions:
            print(f"💡 Sample Solution: {solutions[0].description}")

        return True

    except Exception as e:
        print(f"❌ Manual analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def cleanup_test_data():
    """Clean up test data"""
    print("\n🧹 Cleaning up test data...")

    db = SessionLocal()
    try:
        deleted_items = db.query(InventoryItem).filter(InventoryItem.name.like("Test%")).delete()
        deleted_signals = db.query(IntelligenceSignal).filter(IntelligenceSignal.name.like("Test%")).delete()
        deleted_recs = db.query(Recommendation).filter(Recommendation.title.like("Test%")).delete()

        db.commit()
        print(f"✅ Cleanup complete: {deleted_items} items, {deleted_signals} signals, {deleted_recs} recommendations")

    except Exception as e:
        print(f"❌ Cleanup failed: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main test function"""
    print("🚀 Kopik Intelligence Agent Test Suite")
    print("=" * 50)

    # Run tests
    tests = [
        ("Setting up test data", setup_test_data),
        ("Database connection", test_database_connection),
        ("API endpoints", test_api_endpoints),
        ("Agent communication", test_agent_communication),
        ("Manual analysis", run_manual_analysis)
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n🧪 Running: {test_name}")
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = asyncio.run(test_func())
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Test failed: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)

    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1

    print(f"\nResult: {passed}/{len(results)} tests passed")

    # Cleanup
    response = input("\n🧹 Clean up test data? (y/n): ")
    if response.lower() == 'y':
        cleanup_test_data()

    if passed == len(results):
        print("\n🎉 All tests passed! Your agent is ready to run.")
        print("\nNext steps:")
        print("1. Start your FastAPI server: python main.py")
        print("2. Run the agent: python agents/run_agent.py agent")
        print("3. Trigger analysis: python agents/run_agent.py analyze")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main()