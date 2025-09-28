#!/usr/bin/env python3
"""
Quick test script to verify the agent setup
Run this first to check if everything is working
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing imports...")

    try:
        import uagents
        print("✅ uagents imported")
    except ImportError:
        print("❌ uagents not installed. Run: pip install uagents==0.12.0")
        return False

    try:
        import requests
        print("✅ requests imported")
    except ImportError:
        print("❌ requests not installed. Run: pip install requests")
        return False

    try:
        from database import get_db, InventoryItem, IntelligenceSignal, Recommendation
        print("✅ Database models imported")
    except ImportError as e:
        print(f"❌ Database import failed: {e}")
        return False

    try:
        from models import Priority, RecommendationCategory, SignalCategory
        print("✅ Pydantic models imported")
    except ImportError as e:
        print(f"❌ Models import failed: {e}")
        return False

    return True

def test_database():
    """Test database connection"""
    print("\n🗄️  Testing database...")

    try:
        from database import SessionLocal
        db = SessionLocal()
        db.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def check_database_setup():
    """Check if database has been set up"""
    print("\n📊 Checking database setup...")

    try:
        from database import SessionLocal, InventoryItem, IntelligenceSignal, Recommendation

        db = SessionLocal()
        try:
            inventory_count = db.query(InventoryItem).count()
            signals_count = db.query(IntelligenceSignal).count()
            recs_count = db.query(Recommendation).count()

            print(f"✅ Database contains:")
            print(f"   - {inventory_count} inventory items")
            print(f"   - {signals_count} intelligence signals")
            print(f"   - {recs_count} recommendations")

            if inventory_count == 0 and signals_count == 0:
                print("ℹ️  Database is empty. Consider running populate_database.py")

            return True

        finally:
            db.close()

    except Exception as e:
        print(f"❌ Database check failed: {e}")
        return False

def main():
    """Run quick tests"""
    print("🚀 Kopik Agent Quick Test")
    print("=" * 30)

    tests = [
        test_imports,
        test_database,
        check_database_setup
    ]

    all_passed = True
    for test in tests:
        if not test():
            all_passed = False

    print("\n" + "=" * 30)
    if all_passed:
        print("🎉 Quick test passed! You can now run the full test:")
        print("   python agents/test_agent.py")
        print("\nOr start the agent directly:")
        print("   python agents/run_agent.py agent")
    else:
        print("❌ Some tests failed. Please fix the issues above.")

if __name__ == "__main__":
    main()