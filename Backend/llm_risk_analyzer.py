"""
LLM-Powered Risk Analysis for Kopik
Identifies hidden patterns, risks, and opportunities across all business data
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

class LLMRiskAnalyzer:
    """Advanced risk and opportunity analysis using LLM pattern recognition"""

    def __init__(self):
        api_key = os.getenv('GOOGLE_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        else:
            self.model = None

    def analyze_business_patterns(self, comprehensive_data: Dict) -> Dict:
        """Analyze all business data for hidden patterns and risks"""
        if not self.model:
            return {"risk_level": "moderate", "insights": ["Analysis requires LLM capabilities"]}

        # Prepare comprehensive data summary
        prompt = f"""
You are a senior business consultant analyzing a restaurant's operational data. Provide a structured JSON analysis.

**CURRENT BUSINESS DATA:**

📊 **Inventory Status:**
- {len(comprehensive_data.get('inventory', []))} items with low stock
- Critical items: {', '.join([item.name for item in comprehensive_data.get('inventory', [])[:3]])}

🗑️ **Food Waste Patterns:**
- {len(comprehensive_data.get('food_waste', []))} waste incidents in recent period
- Total waste cost impact: ${sum(waste.cost_impact for waste in comprehensive_data.get('food_waste', [])):.0f}

🎉 **Upcoming Events:**
- {len(comprehensive_data.get('events', []))} events in next 2 weeks
- Major events: {', '.join([event.name for event in comprehensive_data.get('events', [])[:2]])}

💰 **Sales Performance:**
- {len(comprehensive_data.get('sales', []))} recent transactions
- Revenue trend: {'Increasing' if len(comprehensive_data.get('sales', [])) > 30 else 'Moderate'}

📦 **Supply Chain:**
- {len(comprehensive_data.get('orders', []))} pending/delayed orders
- Supply chain reliability: {'At Risk' if len(comprehensive_data.get('orders', [])) > 2 else 'Stable'}

🌤️ **Weather Context:**
- Recent weather data available: {len(comprehensive_data.get('weather', []))} records

**REQUIRED: Return ONLY valid JSON in this exact format:**

{{
  "risk_level": "low|moderate|high|critical",
  "overall_assessment": "Brief 1-sentence summary of business health",
  "top_risks": [
    {{
      "risk": "Risk description",
      "impact": "financial|operational|reputation",
      "estimated_cost": 1000,
      "timeframe": "immediate|1-2 weeks|1 month",
      "mitigation": "Specific action to take"
    }}
  ],
  "opportunities": [
    {{
      "opportunity": "Opportunity description",
      "profit_potential": 1500,
      "implementation": "How to execute",
      "timeline": "24-48 hours|1 week|1 month"
    }}
  ],
  "operational_insights": [
    {{
      "insight": "Operational finding",
      "action": "Recommended action",
      "impact": "Expected benefit"
    }}
  ],
  "key_patterns": [
    "Pattern 1 observed in the data",
    "Pattern 2 that requires attention"
  ]
}}

Return ONLY the JSON, no other text or formatting.
"""

        try:
            response = self.model.generate_content(prompt)
            analysis_text = response.text.strip()

            # Clean up the response and try to parse JSON
            # Remove any markdown formatting
            if "```json" in analysis_text:
                analysis_text = analysis_text.split("```json")[1].split("```")[0].strip()
            elif "```" in analysis_text:
                analysis_text = analysis_text.split("```")[1].split("```")[0].strip()

            try:
                import json
                parsed_analysis = json.loads(analysis_text)

                # Validate required fields
                if "risk_level" not in parsed_analysis:
                    parsed_analysis["risk_level"] = "moderate"

                return parsed_analysis

            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "risk_level": "moderate",
                    "overall_assessment": "Analysis completed but JSON parsing failed",
                    "top_risks": [{"risk": "Data parsing issue", "impact": "operational", "estimated_cost": 0, "timeframe": "immediate", "mitigation": "Review analysis system"}],
                    "opportunities": [],
                    "operational_insights": [],
                    "key_patterns": ["Raw response received but could not parse"],
                    "raw_response": analysis_text[:200]  # First 200 chars for debugging
                }

        except Exception as e:
            return {
                "risk_level": "moderate",
                "overall_assessment": "Analysis system unavailable",
                "top_risks": [],
                "opportunities": [],
                "operational_insights": [],
                "key_patterns": [f"System error: {str(e)[:50]}"],
                "confidence": 0
            }

    def identify_seasonal_opportunities(self, sales_data: List, events_data: List, weather_data: List) -> List[str]:
        """Identify seasonal and event-based opportunities"""
        if not self.model:
            return ["Seasonal analysis requires LLM capabilities"]

        prompt = f"""
Based on this restaurant's data, identify 3 specific seasonal/event opportunities for the next 30 days:

**Sales History**: {len(sales_data)} recent transactions
**Upcoming Events**: {len(events_data)} scheduled events
**Weather Trends**: {len(weather_data)} weather data points

Generate specific, actionable opportunities with estimated profit impact. Focus on:
1. Menu modifications for weather/season
2. Event-specific promotions
3. Timing-based pricing strategies

Format: "Opportunity: [Description] - Est. Impact: $[Amount]"
"""

        try:
            response = self.model.generate_content(prompt)
            opportunities = response.text.strip().split('\n')
            return [opp.strip() for opp in opportunities if opp.strip()][:3]
        except:
            return ["Advanced seasonal analysis unavailable"]

# Singleton
risk_analyzer = LLMRiskAnalyzer()