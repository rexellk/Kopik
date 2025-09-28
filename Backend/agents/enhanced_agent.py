#!/usr/bin/env python3
"""
Enhanced Kopik Intelligence Agent with comprehensive data analysis
Analyzes FoodWaste, Weather, Events, Sales, and Orders data
"""

import sys
import os
from datetime import datetime, date, timedelta
import time
from typing import Dict, List, Any
import random

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import (
    SessionLocal, InventoryItem, IntelligenceSignal, Recommendation,
    FoodWaste, Weather, Event, Sale, Order
)
from models import (
    Priority, RecommendationCategory, WasteReason, WeatherCondition,
    EventType, CustomerType, OrderStatus
)

class EnhancedKopikAgent:
    """Enhanced intelligence agent with comprehensive data analysis"""

    def __init__(self):
        self.analysis_count = 0
        self.last_summary = None
        self.last_analysis_data = None
        print("🤖 Enhanced Kopik Intelligence Agent initialized")

    def fetch_comprehensive_data(self):
        """Fetch all types of data for comprehensive analysis"""
        db = SessionLocal()
        try:
            today = date.today()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)

            # Existing data
            low_stock_items = db.query(InventoryItem).filter(
                InventoryItem.current_stock <= InventoryItem.reorder_point
            ).all()

            intelligence_signals = db.query(IntelligenceSignal).order_by(
                IntelligenceSignal.created_at.desc()
            ).limit(50).all()

            # New data sources
            recent_waste = db.query(FoodWaste).filter(
                FoodWaste.waste_date >= week_ago
            ).all()

            recent_weather = db.query(Weather).filter(
                Weather.date >= week_ago
            ).order_by(Weather.date.desc()).all()

            upcoming_events = db.query(Event).filter(
                Event.start_date >= today,
                Event.start_date <= today + timedelta(days=14)
            ).all()

            recent_sales = db.query(Sale).filter(
                Sale.sale_date >= week_ago
            ).all()

            pending_orders = db.query(Order).filter(
                Order.status.in_([OrderStatus.PENDING, OrderStatus.DELAYED])
            ).all()

            # Sales trends (last 30 days)
            sales_trends = db.query(Sale).filter(
                Sale.sale_date >= month_ago
            ).all()

            return {
                "inventory": low_stock_items,
                "intelligence_signals": intelligence_signals,
                "food_waste": recent_waste,
                "weather": recent_weather,
                "events": upcoming_events,
                "sales": recent_sales,
                "orders": pending_orders,
                "sales_trends": sales_trends
            }
        finally:
            db.close()

    def analyze_food_waste(self, waste_data: List[Any]) -> tuple:
        """Analyze food waste patterns and generate recommendations"""
        alerts = []
        solutions = []

        if not waste_data:
            return alerts, solutions

        # Group waste by item and reason
        waste_by_item = {}
        waste_by_reason = {}
        total_cost_impact = 0

        for waste in waste_data:
            item_id = waste.item_id
            reason = waste.reason
            cost = waste.cost_impact

            waste_by_item[item_id] = waste_by_item.get(item_id, 0) + cost
            waste_by_reason[reason] = waste_by_reason.get(reason, 0) + cost
            total_cost_impact += cost

        # High waste items
        high_waste_threshold = 50.0  # $50 in waste per week
        for item_id, cost in waste_by_item.items():
            if cost > high_waste_threshold:
                alerts.append({
                    "type": "high_waste",
                    "message": f"High waste detected for {item_id}: ${cost:.2f} in the last week",
                    "priority": Priority.HIGH,
                    "category": RecommendationCategory.WASTE
                })

                solutions.append({
                    "description": f"Implement portion control and demand forecasting for {item_id}",
                    "confidence": 80.0,
                    "profit_impact": cost * 0.7  # 70% reduction potential
                })

        # Waste pattern analysis
        if WasteReason.EXPIRED in waste_by_reason:
            expired_cost = waste_by_reason[WasteReason.EXPIRED]
            if expired_cost > 30.0:
                alerts.append({
                    "type": "expiration_waste",
                    "message": f"High expiration waste: ${expired_cost:.2f} in expired products",
                    "priority": Priority.MEDIUM,
                    "category": RecommendationCategory.WASTE
                })

                solutions.append({
                    "description": "Implement FIFO rotation and better inventory tracking",
                    "confidence": 85.0,
                    "profit_impact": expired_cost * 0.8
                })

        return alerts, solutions

    def analyze_weather_impact(self, weather_data: List[Any], sales_data: List[Any]) -> tuple:
        """Analyze weather patterns and their impact on sales"""
        alerts = []
        solutions = []

        if not weather_data:
            return alerts, solutions

        # Get current weather
        current_weather = weather_data[0] if weather_data else None
        if current_weather:
            condition = current_weather.condition
            temp_high = current_weather.temperature_high
            precipitation = current_weather.precipitation_chance or 0

            # Weather-based recommendations
            if condition == WeatherCondition.RAINY or precipitation > 70:
                alerts.append({
                    "type": "weather_opportunity",
                    "message": f"Rainy weather expected: {precipitation}% precipitation chance",
                    "priority": Priority.MEDIUM,
                    "category": RecommendationCategory.WEATHER
                })

                solutions.append({
                    "description": "Increase hot beverage inventory and comfort food options",
                    "confidence": 75.0,
                    "profit_impact": 200.0
                })

            elif temp_high > 80:  # Hot weather
                alerts.append({
                    "type": "weather_opportunity",
                    "message": f"Hot weather expected: {temp_high}°F high temperature",
                    "priority": Priority.MEDIUM,
                    "category": RecommendationCategory.WEATHER
                })

                solutions.append({
                    "description": "Increase cold beverage and ice cream inventory",
                    "confidence": 80.0,
                    "profit_impact": 300.0
                })

            elif temp_high < 40:  # Cold weather
                alerts.append({
                    "type": "weather_opportunity",
                    "message": f"Cold weather expected: {temp_high}°F high temperature",
                    "priority": Priority.MEDIUM,
                    "category": RecommendationCategory.WEATHER
                })

                solutions.append({
                    "description": "Increase hot food and warm beverage inventory",
                    "confidence": 75.0,
                    "profit_impact": 250.0
                })

        return alerts, solutions

    def analyze_events(self, events_data: List[Any]) -> tuple:
        """Analyze upcoming events and their business impact"""
        alerts = []
        solutions = []

        for event in events_data:
            attendance = event.expected_attendance or 0
            impact_multiplier = event.impact_multiplier or 1.0
            days_until = (event.start_date - date.today()).days

            if attendance > 100 and days_until <= 7:
                priority = Priority.HIGH if days_until <= 3 else Priority.MEDIUM

                alerts.append({
                    "type": "upcoming_event",
                    "message": f"Major event in {days_until} days: {event.name} ({attendance} expected)",
                    "priority": priority,
                    "category": RecommendationCategory.DEMAND
                })

                inventory_increase = min(attendance * 0.1, 100)  # Cap at 100% increase
                profit_estimate = attendance * 5.0 * impact_multiplier  # $5 per person

                solutions.append({
                    "description": f"Increase inventory by {inventory_increase:.0f}% for {event.name}",
                    "confidence": 85.0,
                    "profit_impact": profit_estimate
                })

                # Specific recommendations by event type
                if event.event_type == EventType.SPORTS:
                    solutions.append({
                        "description": "Stock up on quick snacks, beverages, and finger foods",
                        "confidence": 90.0,
                        "profit_impact": profit_estimate * 0.3
                    })
                elif event.event_type == EventType.FESTIVAL:
                    solutions.append({
                        "description": "Prepare special menu items and increase beverage stock",
                        "confidence": 85.0,
                        "profit_impact": profit_estimate * 0.4
                    })

        return alerts, solutions

    def analyze_sales_trends(self, sales_data: List[Any]) -> tuple:
        """Analyze sales trends and patterns"""
        alerts = []
        solutions = []

        if not sales_data:
            return alerts, solutions

        # Group sales by item
        sales_by_item = {}
        total_revenue = 0

        for sale in sales_data:
            item_id = sale.item_id
            amount = sale.total_amount

            if item_id not in sales_by_item:
                sales_by_item[item_id] = {"revenue": 0, "quantity": 0}

            sales_by_item[item_id]["revenue"] += amount
            sales_by_item[item_id]["quantity"] += sale.quantity_sold
            total_revenue += amount

        # Identify top performers
        sorted_items = sorted(sales_by_item.items(), key=lambda x: x[1]["revenue"], reverse=True)

        if len(sorted_items) > 0:
            top_item = sorted_items[0]
            top_revenue = top_item[1]["revenue"]

            if top_revenue > total_revenue * 0.3:  # If one item is >30% of revenue
                alerts.append({
                    "type": "high_performer",
                    "message": f"Top seller {top_item[0]} generates ${top_revenue:.2f} (high dependency)",
                    "priority": Priority.MEDIUM,
                    "category": RecommendationCategory.SALES
                })

                solutions.append({
                    "description": f"Ensure adequate stock of top performer {top_item[0]}",
                    "confidence": 95.0,
                    "profit_impact": top_revenue * 0.1
                })

        # Identify underperformers
        if len(sorted_items) > 3:
            bottom_items = sorted_items[-3:]
            low_revenue_threshold = total_revenue * 0.02  # Less than 2% of total

            for item_id, data in bottom_items:
                if data["revenue"] < low_revenue_threshold:
                    alerts.append({
                        "type": "underperformer",
                        "message": f"Low sales for {item_id}: only ${data['revenue']:.2f}",
                        "priority": Priority.LOW,
                        "category": RecommendationCategory.SALES
                    })

                    solutions.append({
                        "description": f"Consider promoting or discontinuing {item_id}",
                        "confidence": 70.0,
                        "profit_impact": 50.0
                    })

        return alerts, solutions

    def analyze_orders(self, orders_data: List[Any]) -> tuple:
        """Analyze order status and supply chain issues"""
        alerts = []
        solutions = []

        delayed_orders = []
        overdue_orders = []
        today = date.today()

        for order in orders_data:
            if order.status == OrderStatus.DELAYED:
                delayed_orders.append(order)
            elif order.expected_delivery and order.expected_delivery < today:
                overdue_orders.append(order)

        # Delayed orders
        if delayed_orders:
            total_delayed_cost = sum(order.total_cost for order in delayed_orders)
            alerts.append({
                "type": "delayed_orders",
                "message": f"{len(delayed_orders)} delayed orders worth ${total_delayed_cost:.2f}",
                "priority": Priority.HIGH,
                "category": RecommendationCategory.ORDERS
            })

            solutions.append({
                "description": "Contact suppliers for delayed orders and find alternative sources",
                "confidence": 85.0,
                "profit_impact": total_delayed_cost * 0.1
            })

        # Overdue orders
        if overdue_orders:
            total_overdue_cost = sum(order.total_cost for order in overdue_orders)
            alerts.append({
                "type": "overdue_orders",
                "message": f"{len(overdue_orders)} overdue orders worth ${total_overdue_cost:.2f}",
                "priority": Priority.HIGH,
                "category": RecommendationCategory.ORDERS
            })

            solutions.append({
                "description": "Immediate follow-up on overdue deliveries and emergency sourcing",
                "confidence": 90.0,
                "profit_impact": total_overdue_cost * 0.2
            })

        return alerts, solutions

    def generate_summary(self, all_alerts: List[Dict], all_solutions: List[Dict], data_overview: Dict) -> str:
        """Generate LLM-powered summary of analysis results"""
        try:
            # Import LLM service
            parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            sys.path.append(parent_dir)
            from llm_summary import llm_service

            return llm_service.generate_business_summary(all_alerts, all_solutions, data_overview)
        except Exception as e:
            print(f"⚠️ LLM summary failed, using fallback: {e}")
            # Fallback summary
            high_priority = len([a for a in all_alerts if a.get('priority') == 'high'])
            total_impact = sum(s.get('profit_impact', 0) for s in all_solutions)

            if high_priority > 0:
                return f"URGENT: {high_priority} critical issues detected. AI analysis identified ${total_impact:.0f} in potential profit optimization across {len(all_solutions)} recommendations."
            elif len(all_alerts) > 0:
                return f"ATTENTION: {len(all_alerts)} items need attention. ${total_impact:.0f} in optimization opportunities identified."
            else:
                return f"GOOD: Operations running smoothly. ${total_impact:.0f} in potential optimizations available."

    def run_comprehensive_analysis(self):
        """Run complete analysis of all data sources"""
        print(f"\n🔍 Running comprehensive analysis #{self.analysis_count + 1}...")

        try:
            # Fetch all data
            data = self.fetch_comprehensive_data()

            print(f"📊 Data summary:")
            print(f"   - Inventory: {len(data['inventory'])} low stock items")
            print(f"   - Food waste: {len(data['food_waste'])} recent waste records")
            print(f"   - Weather: {len(data['weather'])} recent weather records")
            print(f"   - Events: {len(data['events'])} upcoming events")
            print(f"   - Sales: {len(data['sales'])} recent sales")
            print(f"   - Orders: {len(data['orders'])} pending/delayed orders")

            all_alerts = []
            all_solutions = []

            # Analyze each data source
            inventory_alerts, inventory_solutions = self.analyze_inventory(data['inventory'])
            waste_alerts, waste_solutions = self.analyze_food_waste(data['food_waste'])
            weather_alerts, weather_solutions = self.analyze_weather_impact(data['weather'], data['sales'])
            event_alerts, event_solutions = self.analyze_events(data['events'])
            sales_alerts, sales_solutions = self.analyze_sales_trends(data['sales_trends'])
            order_alerts, order_solutions = self.analyze_orders(data['orders'])

            # Combine all results
            all_alerts.extend(inventory_alerts)
            all_alerts.extend(waste_alerts)
            all_alerts.extend(weather_alerts)
            all_alerts.extend(event_alerts)
            all_alerts.extend(sales_alerts)
            all_alerts.extend(order_alerts)

            all_solutions.extend(inventory_solutions)
            all_solutions.extend(waste_solutions)
            all_solutions.extend(weather_solutions)
            all_solutions.extend(event_solutions)
            all_solutions.extend(sales_solutions)
            all_solutions.extend(order_solutions)

            # Store recommendations
            if all_solutions:
                self.store_recommendations(all_solutions)

            # Generate summary
            high_priority = len([a for a in all_alerts if a.get('priority') == Priority.HIGH])
            medium_priority = len([a for a in all_alerts if a.get('priority') == Priority.MEDIUM])

            total_profit_impact = sum(s.get('profit_impact', 0) for s in all_solutions)

            print(f"\n📈 Analysis Results:")
            print(f"   - {high_priority} high priority alerts")
            print(f"   - {medium_priority} medium priority alerts")
            print(f"   - {len(all_solutions)} recommendations generated")
            print(f"   - ${total_profit_impact:.2f} total profit impact potential")

            # Generate LLM summary
            data_overview = {
                "low_stock_items": len(data['inventory']),
                "recent_waste_records": len(data['food_waste']),
                "upcoming_events": len(data['events']),
                "pending_orders": len(data['orders'])
            }

            summary = self.generate_summary(all_alerts, all_solutions, data_overview)
            print(f"\n📝 Business Summary:")
            print(f"   {summary}")

            # Show sample insights by category
            self.display_category_insights(all_alerts, all_solutions)

            self.analysis_count += 1

            # Store summary for API access
            self.last_summary = summary
            self.last_analysis_data = {
                "alerts": all_alerts,
                "solutions": all_solutions,
                "data_overview": data_overview,
                "summary": summary,
                "timestamp": datetime.now().isoformat()
            }

            return True

        except Exception as e:
            print(f"❌ Comprehensive analysis failed: {e}")
            return False

    def analyze_inventory(self, inventory_data: List[Any]) -> tuple:
        """Analyze inventory data (original functionality)"""
        alerts = []
        solutions = []

        for item in inventory_data:
            alerts.append({
                "type": "low_stock",
                "message": f"Low stock: {item.name} ({item.current_stock} units remaining)",
                "priority": Priority.HIGH if item.current_stock == 0 else Priority.MEDIUM,
                "category": RecommendationCategory.INVENTORY
            })

            solutions.append({
                "description": f"Reorder {item.name} immediately or source from alternative supplier",
                "confidence": random.uniform(75.0, 99.0),
                "profit_impact": item.cost_per_unit * item.daily_usage * 7
            })

        return alerts, solutions

    def store_recommendations(self, solutions: List[Dict]):
        """Store new recommendations in database"""
        db = SessionLocal()
        try:
            stored_count = 0
            for solution in solutions:
                recommendation = Recommendation(
                    priority=Priority.MEDIUM,
                    title="Enhanced AI Agent Recommendation",
                    description=solution["description"],
                    confidence=solution["confidence"],
                    profit_impact=solution.get("profit_impact"),
                    action_required=True,
                    category=RecommendationCategory.INVENTORY
                )

                db.add(recommendation)
                stored_count += 1

            db.commit()
            print(f"💾 Stored {stored_count} new recommendations")

        except Exception as e:
            print(f"❌ Error storing recommendations: {e}")
            db.rollback()
        finally:
            db.close()

    def display_category_insights(self, alerts: List[Dict], solutions: List[Dict]):
        """Display insights organized by category"""
        categories = {}

        for alert in alerts:
            cat = alert.get('category', 'other')
            if cat not in categories:
                categories[cat] = {'alerts': 0, 'solutions': 0}
            categories[cat]['alerts'] += 1

        print(f"\n📋 Insights by Category:")
        for category, counts in categories.items():
            print(f"   - {category.upper()}: {counts['alerts']} alerts")

    def run_continuous(self, interval=300):
        """Run continuous comprehensive analysis"""
        print(f"🚀 Starting enhanced continuous analysis (every {interval//60} minutes)")
        print("Press Ctrl+C to stop")

        try:
            while True:
                self.run_comprehensive_analysis()
                print(f"⏰ Next analysis in {interval//60} minutes...")
                time.sleep(interval)

        except KeyboardInterrupt:
            print(f"\n🛑 Enhanced agent stopped after {self.analysis_count} analyses")

def main():
    """Main function"""
    print("🚀 Enhanced Kopik Intelligence Agent")
    print("=" * 50)

    agent = EnhancedKopikAgent()

    if len(sys.argv) > 1 and sys.argv[1] == "once":
        agent.run_comprehensive_analysis()
    else:
        agent.run_continuous()

if __name__ == "__main__":
    main()