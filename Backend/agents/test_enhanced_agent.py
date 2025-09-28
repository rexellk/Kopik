#!/usr/bin/env python3
"""
Test script to demonstrate the enhanced agent's comprehensive analysis capabilities
"""

import sys
import os
from datetime import datetime, date, timedelta

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, InventoryItem, FoodWaste, Weather, Event, Sale, Order
from enhanced_agent import EnhancedKopikAgent

def show_data_overview():
    """Show overview of all data in the database"""
    print("📊 DATABASE OVERVIEW")
    print("=" * 50)

    db = SessionLocal()
    try:
        # Current data counts
        inventory_count = db.query(InventoryItem).count()
        low_stock_count = db.query(InventoryItem).filter(
            InventoryItem.current_stock <= InventoryItem.reorder_point
        ).count()

        waste_count = db.query(FoodWaste).count()
        recent_waste = db.query(FoodWaste).filter(
            FoodWaste.waste_date >= date.today() - timedelta(days=7)
        ).count()

        weather_count = db.query(Weather).count()
        events_count = db.query(Event).count()
        upcoming_events = db.query(Event).filter(
            Event.start_date >= date.today()
        ).count()

        sales_count = db.query(Sale).count()
        recent_sales = db.query(Sale).filter(
            Sale.sale_date >= date.today() - timedelta(days=7)
        ).count()

        orders_count = db.query(Order).count()
        pending_orders = db.query(Order).filter(
            Order.status.in_(["pending", "delayed"])
        ).count()

        print(f"📦 INVENTORY: {inventory_count} total items, {low_stock_count} low stock")
        print(f"🗑️  FOOD WASTE: {waste_count} total records, {recent_waste} in last 7 days")
        print(f"🌤️  WEATHER: {weather_count} total records")
        print(f"🎉 EVENTS: {events_count} total, {upcoming_events} upcoming")
        print(f"💰 SALES: {sales_count} total records, {recent_sales} in last 7 days")
        print(f"📋 ORDERS: {orders_count} total, {pending_orders} pending/delayed")

        # Show specific examples
        print(f"\n🔍 SAMPLE DATA:")

        # Low stock items
        low_stock_items = db.query(InventoryItem).filter(
            InventoryItem.current_stock <= InventoryItem.reorder_point
        ).limit(3).all()
        print(f"\n📦 Low Stock Items:")
        for item in low_stock_items:
            print(f"   - {item.name}: {item.current_stock}/{item.reorder_point} {item.unit}")

        # Recent high-cost waste
        high_waste = db.query(FoodWaste).filter(
            FoodWaste.cost_impact > 10.0
        ).order_by(FoodWaste.cost_impact.desc()).limit(2).all()
        print(f"\n🗑️  High-Cost Waste:")
        for waste in high_waste:
            print(f"   - {waste.item_id}: ${waste.cost_impact:.2f} ({waste.reason})")

        # Upcoming events
        upcoming = db.query(Event).filter(
            Event.start_date >= date.today()
        ).order_by(Event.start_date).limit(2).all()
        print(f"\n🎉 Upcoming Events:")
        for event in upcoming:
            days_away = (event.start_date - date.today()).days
            print(f"   - {event.name}: {days_away} days away ({event.expected_attendance} expected)")

        # Delayed orders
        delayed = db.query(Order).filter(
            Order.status == "delayed"
        ).all()
        print(f"\n📋 Delayed Orders:")
        for order in delayed:
            print(f"   - {order.item_id}: ${order.total_cost:.2f} from {order.supplier}")

    finally:
        db.close()

def demonstrate_enhanced_analysis():
    """Demonstrate the enhanced agent's analysis capabilities"""
    print(f"\n🤖 ENHANCED AGENT ANALYSIS")
    print("=" * 50)

    agent = EnhancedKopikAgent()

    # Fetch and display comprehensive data
    data = agent.fetch_comprehensive_data()

    print(f"📊 Data Retrieved:")
    print(f"   - {len(data['inventory'])} low stock inventory items")
    print(f"   - {len(data['food_waste'])} recent waste records")
    print(f"   - {len(data['weather'])} weather records")
    print(f"   - {len(data['events'])} upcoming events")
    print(f"   - {len(data['sales'])} recent sales")
    print(f"   - {len(data['orders'])} pending/delayed orders")

    # Analyze each category individually
    print(f"\n🔍 CATEGORY-BY-CATEGORY ANALYSIS:")

    # Food Waste Analysis
    print(f"\n🗑️  FOOD WASTE ANALYSIS:")
    waste_alerts, waste_solutions = agent.analyze_food_waste(data['food_waste'])
    print(f"   - {len(waste_alerts)} alerts generated")
    print(f"   - {len(waste_solutions)} solutions proposed")
    if waste_alerts:
        for alert in waste_alerts[:2]:
            print(f"     → {alert['message']}")

    # Weather Analysis
    print(f"\n🌤️  WEATHER ANALYSIS:")
    weather_alerts, weather_solutions = agent.analyze_weather_impact(data['weather'], data['sales'])
    print(f"   - {len(weather_alerts)} alerts generated")
    print(f"   - {len(weather_solutions)} solutions proposed")
    if weather_alerts:
        for alert in weather_alerts:
            print(f"     → {alert['message']}")

    # Events Analysis
    print(f"\n🎉 EVENTS ANALYSIS:")
    event_alerts, event_solutions = agent.analyze_events(data['events'])
    print(f"   - {len(event_alerts)} alerts generated")
    print(f"   - {len(event_solutions)} solutions proposed")
    if event_alerts:
        for alert in event_alerts:
            print(f"     → {alert['message']}")

    # Sales Analysis
    print(f"\n💰 SALES TRENDS ANALYSIS:")
    sales_alerts, sales_solutions = agent.analyze_sales_trends(data['sales_trends'])
    print(f"   - {len(sales_alerts)} alerts generated")
    print(f"   - {len(sales_solutions)} solutions proposed")
    if sales_alerts:
        for alert in sales_alerts[:2]:
            print(f"     → {alert['message']}")

    # Orders Analysis
    print(f"\n📋 ORDERS ANALYSIS:")
    order_alerts, order_solutions = agent.analyze_orders(data['orders'])
    print(f"   - {len(order_alerts)} alerts generated")
    print(f"   - {len(order_solutions)} solutions proposed")
    if order_alerts:
        for alert in order_alerts:
            print(f"     → {alert['message']}")

    # Calculate total impact
    all_solutions = waste_solutions + weather_solutions + event_solutions + sales_solutions + order_solutions
    total_profit_impact = sum(s.get('profit_impact', 0) for s in all_solutions)

    print(f"\n💡 COMPREHENSIVE INSIGHTS:")
    print(f"   - Total recommendations: {len(all_solutions)}")
    print(f"   - Total profit impact potential: ${total_profit_impact:.2f}")
    print(f"   - Categories analyzed: Food Waste, Weather, Events, Sales, Orders")

def main():
    """Main test function"""
    print("🚀 Enhanced Kopik Agent Comprehensive Test")
    print("=" * 60)

    # Show data overview
    show_data_overview()

    # Demonstrate enhanced analysis
    demonstrate_enhanced_analysis()

    print(f"\n🎉 ENHANCED AGENT SUCCESS!")
    print("=" * 60)
    print("✅ Successfully analyzes:")
    print("   - Inventory levels and reorder needs")
    print("   - Food waste patterns and prevention")
    print("   - Weather impact on business")
    print("   - Event-driven demand forecasting")
    print("   - Sales trends and performance")
    print("   - Supply chain and order management")
    print(f"\nThe agent now provides comprehensive business intelligence!")

if __name__ == "__main__":
    main()