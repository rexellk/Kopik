"""
LLM-Powered Dynamic Explanations for Kopik Recommendations
Generates personalized explanations for each recommendation
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class LLMExplanationService:
    """Generate dynamic explanations for recommendations"""

    def __init__(self):
        api_key = os.getenv('GOOGLE_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        else:
            self.model = None

    def explain_recommendation(self, recommendation: dict, context: dict = None) -> str:
        """Generate explanation for a single recommendation"""
        if not self.model:
            return f"Recommended action: {recommendation.get('description', 'No description')}"

        # Build context-aware prompt
        prompt = f"""
You are a business advisor explaining WHY a recommendation is important for a restaurant/cafe.

**Recommendation**: {recommendation.get('description', 'Unknown recommendation')}
**Confidence**: {recommendation.get('confidence', 'Unknown')}%
**Profit Impact**: ${recommendation.get('profit_impact', 0):.0f}

**Business Context**:
- Priority Level: {recommendation.get('priority', 'medium')}
- Category: {recommendation.get('category', 'general')}
"""

        if context:
            prompt += f"""
- Recent Sales: {context.get('recent_sales', 'Unknown')}
- Upcoming Events: {context.get('upcoming_events', 'None')}
- Current Season: {context.get('season', 'Unknown')}
- Weather: {context.get('weather', 'Unknown')}
"""

        prompt += """
Generate a 1-2 sentence explanation that answers:
1. WHY this action is needed right now
2. WHAT happens if they don't act
3. HOW it impacts their bottom line

Make it urgent, specific, and actionable for busy restaurant operators.
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return f"Smart recommendation: {recommendation.get('description', 'Take action to optimize operations')}"

    def explain_alert(self, alert: dict, impact: str = "business operations") -> str:
        """Generate explanation for alerts"""
        if not self.model:
            return alert.get('message', 'Alert detected')

        prompt = f"""
Explain this business alert in 1 sentence for a restaurant manager:

**Alert**: {alert.get('message', 'Business alert')}
**Priority**: {alert.get('priority', 'medium')}
**Category**: {alert.get('category', 'operations')}

Focus on immediate action needed and business impact. Be urgent but not alarmist.
"""

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return alert.get('message', 'Attention required')

# Singleton
explanation_service = LLMExplanationService()