#!/usr/bin/env python3
"""
Simple script to start the Kopik Intelligence Agent
This bypasses some of the complex uagents setup for a more direct approach
"""

import asyncio
import sys
import os
from datetime import datetime
import time

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, InventoryItem, IntelligenceSignal, Recommendation
from models import Priority, RecommendationCategory

class KopikIntelligenceAgent:
    """Simplified intelligence agent for Kopik"""

    def __init__(self):
        self.analysis_count = 0
        print("🤖 Kopik Intelligence Agent initialized")

    def fetch_data(self):
        """Fetch data from database"""
        db = SessionLocal()
        try:
            # Get low stock items
            low_stock_items = db.query(InventoryItem).filter(
                InventoryItem.current_stock <= InventoryItem.reorder_point
            ).all()

            # Get recent intelligence signals
            intelligence_signals = db.query(IntelligenceSignal).order_by(
                IntelligenceSignal.created_at.desc()
            ).limit(50).all()

            # Get high priority recommendations
            recommendations = db.query(Recommendation).filter(
                Recommendation.priority == Priority.HIGH
            ).all()

            return {
                "inventory": low_stock_items,
                "intelligence_signals": intelligence_signals,
                "recommendations": recommendations
            }
        finally:
            db.close()

    def process_data(self, data):
        """Process the fetched data and generate insights"""
        alerts = []
        solutions = []

        # Process inventory
        for item in data["inventory"]:
            alert = {
                "type": "low_stock",
                "message": f"Low stock: {item.name} ({item.current_stock} units remaining)",
                "priority": Priority.HIGH if item.current_stock == 0 else Priority.MEDIUM,
                "category": RecommendationCategory.INVENTORY
            }
            alerts.append(alert)

            solution = {
                "description": f"Reorder {item.name} immediately or source from alternative supplier",
                "confidence": 85.0,
                "profit_impact": item.cost_per_unit * item.daily_usage * 7
            }
            solutions.append(solution)

        # Process intelligence signals
        for signal in data["intelligence_signals"]:
            category = signal.category.lower() if signal.category else ""

            if 'weather' in category or 'environment' in category:
                if 'rain' in signal.name.lower():
                    alert = {
                        "type": "weather",
                        "message": f"Weather alert: {signal.name} - {signal.impact_description}",
                        "priority": Priority.MEDIUM,
                        "category": RecommendationCategory.WEATHER
                    }
                    alerts.append(alert)

                    solution = {
                        "description": "Increase warm beverage inventory and comfort food items",
                        "confidence": 75.0,
                        "profit_impact": 500.0
                    }
                    solutions.append(solution)

            elif 'event' in category or 'social' in category:
                alert = {
                    "type": "event",
                    "message": f"Event impact: {signal.name} - {signal.impact_description}",
                    "priority": Priority.HIGH,
                    "category": RecommendationCategory.DEMAND
                }
                alerts.append(alert)

                solution = {
                    "description": "Increase overall inventory by 30% and prepare quick-serve items",
                    "confidence": 90.0,
                    "profit_impact": 1000.0
                }
                solutions.append(solution)

        return alerts, solutions

    def store_recommendations(self, solutions):
        """Store new recommendations in the database"""
        db = SessionLocal()
        try:
            stored_count = 0
            for solution in solutions:
                recommendation = Recommendation(
                    priority=Priority.MEDIUM,
                    title="AI Agent Recommendation",
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

    def run_analysis(self):
        """Run a complete analysis cycle"""
        print(f"\n🔍 Running analysis #{self.analysis_count + 1}...")

        try:
            # Fetch data
            data = self.fetch_data()
            print(f"📊 Data: {len(data['inventory'])} low stock, {len(data['intelligence_signals'])} signals")

            # Process data
            alerts, solutions = self.process_data(data)

            # Store recommendations
            if solutions:
                self.store_recommendations(solutions)

            # Generate summary
            high_priority = len([a for a in alerts if a.get('priority') == Priority.HIGH])
            summary = f"Analysis complete: {high_priority} high priority and {len(alerts) - high_priority} medium priority alerts"

            print(f"📈 {summary}")
            if alerts:
                print(f"   Sample alert: {alerts[0]['message']}")
            if solutions:
                print(f"   Sample solution: {solutions[0]['description'][:60]}...")

            self.analysis_count += 1
            return True

        except Exception as e:
            print(f"❌ Analysis failed: {e}")
            return False

    def run_continuous(self, interval=300):
        """Run continuous analysis every interval seconds"""
        print(f"🚀 Starting continuous analysis (every {interval//60} minutes)")
        print("Press Ctrl+C to stop")

        try:
            while True:
                self.run_analysis()
                print(f"⏰ Next analysis in {interval//60} minutes...")
                time.sleep(interval)

        except KeyboardInterrupt:
            print(f"\n🛑 Agent stopped after {self.analysis_count} analyses")

def main():
    """Main function"""
    print("🚀 Kopik Intelligence Agent")
    print("=" * 40)

    agent = KopikIntelligenceAgent()

    # Check command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "once":
        # Run once
        print("Running single analysis...")
        agent.run_analysis()
    else:
        # Run continuously
        agent.run_continuous()

if __name__ == "__main__":
    main()