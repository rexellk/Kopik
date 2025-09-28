#!/usr/bin/env python3
"""
API interface for the Kopik Intelligence Agent
Provides JSON-formatted insights for frontend consumption
"""

import sys
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from enhanced_agent import EnhancedKopikAgent
from models import Priority, RecommendationCategory

class AgentAPIInterface:
    """Interface to convert agent insights into frontend-friendly JSON"""

    def __init__(self):
        self.agent = EnhancedKopikAgent()

    def get_dashboard_insights(self) -> Dict[str, Any]:
        """Get comprehensive insights formatted for dashboard display"""
        try:
            # Fetch comprehensive data
            data = self.agent.fetch_comprehensive_data()

            # Run all analyses
            all_alerts = []
            all_solutions = []
            category_insights = {}

            # Inventory Analysis
            inventory_alerts, inventory_solutions = self.agent.analyze_inventory(data['inventory'])
            all_alerts.extend(inventory_alerts)
            all_solutions.extend(inventory_solutions)
            category_insights['inventory'] = {
                'alerts_count': len(inventory_alerts),
                'low_stock_items': len(data['inventory']),
                'total_items': len(data['inventory'])
            }

            # Food Waste Analysis
            waste_alerts, waste_solutions = self.agent.analyze_food_waste(data['food_waste'])
            all_alerts.extend(waste_alerts)
            all_solutions.extend(waste_solutions)
            total_waste_cost = sum(w.cost_impact for w in data['food_waste'])
            category_insights['food_waste'] = {
                'alerts_count': len(waste_alerts),
                'total_cost_impact': round(total_waste_cost, 2),
                'waste_records': len(data['food_waste'])
            }

            # Weather Analysis
            weather_alerts, weather_solutions = self.agent.analyze_weather_impact(data['weather'], data['sales'])
            all_alerts.extend(weather_alerts)
            all_solutions.extend(weather_solutions)
            current_weather = data['weather'][0] if data['weather'] else None
            category_insights['weather'] = {
                'alerts_count': len(weather_alerts),
                'current_condition': current_weather.condition if current_weather else None,
                'temperature': current_weather.temperature_high if current_weather else None
            }

            # Events Analysis
            event_alerts, event_solutions = self.agent.analyze_events(data['events'])
            all_alerts.extend(event_alerts)
            all_solutions.extend(event_solutions)
            total_expected_attendance = sum(e.expected_attendance or 0 for e in data['events'])
            category_insights['events'] = {
                'alerts_count': len(event_alerts),
                'upcoming_events': len(data['events']),
                'total_expected_attendance': total_expected_attendance
            }

            # Sales Analysis
            sales_alerts, sales_solutions = self.agent.analyze_sales_trends(data['sales_trends'])
            all_alerts.extend(sales_alerts)
            all_solutions.extend(sales_solutions)
            total_revenue = sum(s.total_amount for s in data['sales'])
            category_insights['sales'] = {
                'alerts_count': len(sales_alerts),
                'recent_sales': len(data['sales']),
                'total_revenue': round(total_revenue, 2)
            }

            # Orders Analysis
            order_alerts, order_solutions = self.agent.analyze_orders(data['orders'])
            all_alerts.extend(order_alerts)
            all_solutions.extend(order_solutions)
            total_order_value = sum(o.total_cost for o in data['orders'])
            category_insights['orders'] = {
                'alerts_count': len(order_alerts),
                'pending_orders': len(data['orders']),
                'total_order_value': round(total_order_value, 2)
            }

            # Calculate priorities and impacts
            high_priority_count = len([a for a in all_alerts if a.get('priority') == Priority.HIGH])
            total_profit_impact = sum(s.get('profit_impact', 0) for s in all_solutions)

            # Format response
            return {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'summary': {
                    'total_alerts': len(all_alerts),
                    'high_priority_alerts': high_priority_count,
                    'total_recommendations': len(all_solutions),
                    'total_profit_impact': round(total_profit_impact, 2)
                },
                'alerts': self._format_alerts(all_alerts),
                'recommendations': self._format_recommendations(all_solutions),
                'categories': category_insights,
                'insights': self._generate_key_insights(all_alerts, all_solutions, category_insights)
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def _format_alerts(self, alerts: List[Dict]) -> List[Dict]:
        """Format alerts for frontend display"""
        formatted_alerts = []

        for alert in alerts:
            formatted_alerts.append({
                'id': len(formatted_alerts) + 1,
                'type': alert.get('type', 'general'),
                'title': self._get_alert_title(alert),
                'message': alert.get('message', ''),
                'priority': alert.get('priority', Priority.MEDIUM),
                'category': alert.get('category', RecommendationCategory.INVENTORY),
                'timestamp': datetime.now().isoformat(),
                'actionable': True
            })

        # Sort by priority (high first)
        priority_order = {Priority.HIGH: 0, Priority.MEDIUM: 1, Priority.LOW: 2}
        formatted_alerts.sort(key=lambda x: priority_order.get(x['priority'], 2))

        return formatted_alerts

    def _format_recommendations(self, solutions: List[Dict]) -> List[Dict]:
        """Format recommendations for frontend display"""
        formatted_recommendations = []

        for solution in solutions:
            formatted_recommendations.append({
                'id': len(formatted_recommendations) + 1,
                'title': self._get_recommendation_title(solution),
                'description': solution.get('description', ''),
                'confidence': round(solution.get('confidence', 80), 1),
                'profit_impact': round(solution.get('profit_impact', 0), 2),
                'priority': 'high' if solution.get('profit_impact', 0) > 500 else 'medium',
                'estimated_implementation': self._estimate_implementation_time(solution),
                'tags': self._get_recommendation_tags(solution)
            })

        # Sort by profit impact (highest first)
        formatted_recommendations.sort(key=lambda x: x['profit_impact'], reverse=True)

        return formatted_recommendations

    def _get_alert_title(self, alert: Dict) -> str:
        """Generate user-friendly alert titles"""
        alert_type = alert.get('type', 'general')
        titles = {
            'low_stock': 'Low Inventory Alert',
            'high_waste': 'Food Waste Warning',
            'weather_opportunity': 'Weather-Based Opportunity',
            'upcoming_event': 'Event Planning Alert',
            'delayed_orders': 'Supply Chain Issue',
            'overdue_orders': 'Urgent Order Follow-up',
            'high_performer': 'Top Product Performance',
            'underperformer': 'Product Performance Issue'
        }
        return titles.get(alert_type, 'Business Alert')

    def _get_recommendation_title(self, solution: Dict) -> str:
        """Generate user-friendly recommendation titles"""
        description = solution.get('description', '')
        if 'reorder' in description.lower():
            return 'Inventory Reorder'
        elif 'increase' in description.lower() and 'inventory' in description.lower():
            return 'Scale Inventory'
        elif 'waste' in description.lower():
            return 'Waste Reduction'
        elif 'weather' in description.lower():
            return 'Weather Adaptation'
        elif 'event' in description.lower():
            return 'Event Preparation'
        elif 'supplier' in description.lower():
            return 'Supplier Management'
        else:
            return 'Business Optimization'

    def _estimate_implementation_time(self, solution: Dict) -> str:
        """Estimate implementation timeframe"""
        description = solution.get('description', '').lower()
        confidence = solution.get('confidence', 80)

        if 'immediate' in description or confidence > 90:
            return 'immediate'
        elif 'reorder' in description or 'contact' in description:
            return '1-2 days'
        elif 'increase' in description or 'prepare' in description:
            return '3-5 days'
        else:
            return '1 week'

    def _get_recommendation_tags(self, solution: Dict) -> List[str]:
        """Generate tags for recommendations"""
        description = solution.get('description', '').lower()
        tags = []

        if 'inventory' in description:
            tags.append('inventory')
        if 'supplier' in description:
            tags.append('supply-chain')
        if 'weather' in description:
            tags.append('weather')
        if 'event' in description:
            tags.append('events')
        if 'waste' in description:
            tags.append('sustainability')
        if 'immediate' in description:
            tags.append('urgent')

        profit_impact = solution.get('profit_impact', 0)
        if profit_impact > 1000:
            tags.append('high-impact')
        elif profit_impact > 100:
            tags.append('medium-impact')

        return tags

    def _generate_key_insights(self, alerts: List[Dict], solutions: List[Dict], categories: Dict) -> List[str]:
        """Generate key business insights"""
        insights = []

        # Alert insights
        high_priority_alerts = [a for a in alerts if a.get('priority') == Priority.HIGH]
        if high_priority_alerts:
            insights.append(f"{len(high_priority_alerts)} critical issues require immediate attention")

        # Financial insights
        total_profit_impact = sum(s.get('profit_impact', 0) for s in solutions)
        if total_profit_impact > 1000:
            insights.append(f"${total_profit_impact:,.0f} in potential profit improvements identified")

        # Category-specific insights
        if categories.get('food_waste', {}).get('total_cost_impact', 0) > 50:
            waste_cost = categories['food_waste']['total_cost_impact']
            insights.append(f"${waste_cost:.0f} in food waste this week - prevention opportunities available")

        if categories.get('events', {}).get('upcoming_events', 0) > 0:
            event_count = categories['events']['upcoming_events']
            attendance = categories['events']['total_expected_attendance']
            insights.append(f"{event_count} upcoming events with {attendance:,} expected attendees")

        # Supply chain insights
        if categories.get('orders', {}).get('alerts_count', 0) > 0:
            insights.append("Supply chain delays detected - alternative sourcing recommended")

        # Default insight if none generated
        if not insights:
            insights.append("All systems operating normally - no critical issues detected")

        return insights

def get_agent_insights() -> Dict[str, Any]:
    """Main function to get agent insights - use this in your API endpoint"""
    interface = AgentAPIInterface()
    return interface.get_dashboard_insights()

if __name__ == "__main__":
    # Test the interface
    print("🧪 Testing Agent API Interface...")
    insights = get_agent_insights()

    if insights['success']:
        print("✅ Successfully generated insights:")
        print(f"   - {insights['summary']['total_alerts']} alerts")
        print(f"   - {insights['summary']['total_recommendations']} recommendations")
        print(f"   - ${insights['summary']['total_profit_impact']:,.2f} profit impact")

        print("\n📋 Key Insights:")
        for insight in insights['insights']:
            print(f"   - {insight}")
    else:
        print(f"❌ Error: {insights['error']}")