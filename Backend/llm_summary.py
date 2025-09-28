"""
LLM Summary Service for Kopik Intelligence Agent
Converts deterministic agent alerts and insights into human-readable summaries
"""

import os
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LLMSummaryService:
    """Service to generate business-friendly summaries from agent alerts and insights"""

    def __init__(self):
        # Initialize Gemini client - will use GOOGLE_API_KEY environment variable
        api_key = os.getenv('GOOGLE_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash-lite')
            print("🤖 Gemini LLM initialized successfully")
        else:
            self.model = None
            print("⚠️ GOOGLE_API_KEY not found, will use fallback summaries")

    def generate_business_summary(self, alerts: List[Dict], solutions: List[Dict], data_overview: Dict) -> str:
        """
        Generate a comprehensive business summary from agent analysis results

        Args:
            alerts: List of alert dictionaries from agent analysis
            solutions: List of solution dictionaries from agent analysis
            data_overview: Dictionary with data counts and metrics

        Returns:
            str: Human-readable business summary
        """

        # Prepare structured data for LLM
        analysis_data = {
            "alerts": alerts,
            "solutions": solutions,
            "data_overview": data_overview,
            "metrics": {
                "total_alerts": len(alerts),
                "high_priority_alerts": len([a for a in alerts if a.get('priority') == 'high']),
                "total_profit_impact": sum(s.get('profit_impact', 0) for s in solutions),
                "total_recommendations": len(solutions)
            }
        }

        # Create prompt for business summary
        prompt = self._create_summary_prompt(analysis_data)

        try:
            if not self.model:
                raise Exception("No LLM model available - GOOGLE_API_KEY not set")

            # Create system prompt + user prompt for Gemini
            full_prompt = f"""You are a business intelligence assistant for Kopik, an AI-powered inventory management system. Generate concise, actionable business summaries from data analysis results.

{prompt}"""

            # Generate content with Gemini
            response = self.model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=300,
                    temperature=0.3  # Low temperature for consistent, factual summaries
                )
            )

            return response.text.strip()

        except Exception as e:
            # For now, raise the exception to see what's wrong with Gemini
            print(f"❌ Gemini LLM failed: {str(e)}")
            raise e
            # return self._generate_fallback_summary(analysis_data)

    def _create_summary_prompt(self, analysis_data: Dict) -> str:
        """Create a structured prompt for the LLM"""

        alerts = analysis_data["alerts"]
        solutions = analysis_data["solutions"]
        metrics = analysis_data["metrics"]
        data_overview = analysis_data["data_overview"]

        # Build prompt with structured data
        prompt = f"""
Analyze this business intelligence data and provide a concise summary for restaurant/cafe operators:

**Current Situation:**
- {metrics['total_alerts']} alerts detected ({metrics['high_priority_alerts']} high priority)
- {metrics['total_recommendations']} recommendations generated
- Potential profit impact: ${metrics['total_profit_impact']:.0f}

**Data Sources Analyzed:**
- {data_overview.get('low_stock_items', 0)} low stock items
- {data_overview.get('recent_waste_records', 0)} recent waste records
- {data_overview.get('upcoming_events', 0)} upcoming events
- {data_overview.get('pending_orders', 0)} pending orders

**Key Alerts:**
"""

        # Add top 3 most important alerts
        for i, alert in enumerate(alerts[:3]):
            prompt += f"- {alert.get('message', 'Alert detected')} (Priority: {alert.get('priority', 'medium')})\n"

        prompt += f"""
**Top Recommendations:**
"""

        # Add top 3 highest impact solutions
        sorted_solutions = sorted(solutions, key=lambda x: x.get('profit_impact', 0), reverse=True)
        for i, solution in enumerate(sorted_solutions[:3]):
            confidence = solution.get('confidence', 80)
            impact = solution.get('profit_impact', 0)
            prompt += f"- {solution.get('description', 'Recommendation available')} (${impact:.0f} impact, {confidence}% confidence)\n"

        prompt += """
Generate a 2-3 sentence executive summary focusing on:
1. Most critical issues requiring immediate attention
2. Biggest opportunities for revenue/cost savings
3. Overall business health assessment

Keep it concise and action-oriented for busy restaurant operators."""

        return prompt

    def _generate_fallback_summary(self, analysis_data: Dict) -> str:
        """Generate an intelligent business summary if LLM is unavailable"""

        metrics = analysis_data["metrics"]
        alerts = analysis_data["alerts"]
        solutions = analysis_data["solutions"]

        high_priority = metrics["high_priority_alerts"]
        total_impact = metrics["total_profit_impact"]

        # Analyze alert types for better context
        alert_types = {}
        for alert in alerts[:5]:  # Top 5 alerts
            alert_type = alert.get('type', 'general')
            alert_types[alert_type] = alert_types.get(alert_type, 0) + 1

        # Generate context-aware summary
        if high_priority > 0:
            if 'low_stock' in alert_types:
                context = f"Low stock alerts and {max(0, high_priority-alert_types.get('low_stock', 0))} other critical issues require immediate action."
            elif 'upcoming_event' in alert_types:
                context = f"Major upcoming events and {max(0, high_priority-1)} other critical issues detected."
            elif 'delayed_orders' in alert_types or 'overdue_orders' in alert_types:
                context = f"Supply chain delays and {max(0, high_priority-1)} other critical issues need attention."
            else:
                context = f"{high_priority} critical operational issues detected."

            # Find highest impact recommendation
            top_rec = max(solutions, key=lambda x: x.get('profit_impact', 0)) if solutions else None
            if top_rec and top_rec.get('profit_impact', 0) > 1000:
                impact_note = f"Priority: ${top_rec.get('profit_impact', 0):.0f} opportunity from {top_rec.get('description', 'top recommendation')[:50]}..."
            else:
                impact_note = f"Total optimization potential: ${total_impact:.0f} across {len(solutions)} AI recommendations."

            return f"🚨 URGENT: {context} {impact_note}"

        elif len(alerts) > 0:
            if total_impact > 5000:
                return f"📊 OPPORTUNITY: {len(alerts)} areas for improvement identified. Significant ${total_impact:.0f} profit optimization potential available. Focus on high-impact recommendations."
            else:
                return f"✅ MONITORING: {len(alerts)} minor issues detected. ${total_impact:.0f} in optimization opportunities identified. Operations stable overall."
        else:
            return f"🎯 OPTIMAL: Operations running smoothly. AI identified ${total_impact:.0f} in additional optimization opportunities for continued growth."

# Singleton instance
llm_service = LLMSummaryService()