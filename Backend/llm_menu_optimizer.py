"""
LLM-Powered Menu Optimization for Kopik
Generates intelligent menu suggestions based on waste, sales, weather, and events
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()

class LLMMenuOptimizer:
    """AI-powered menu optimization using comprehensive business data"""

    def __init__(self):
        api_key = os.getenv('GOOGLE_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        else:
            self.model = None

    def generate_menu_suggestions(self, business_data: Dict) -> Dict:
        """Generate intelligent menu modifications based on all available data"""
        if not self.model:
            return {"suggestions": ["Menu optimization requires LLM capabilities"]}

        # Prepare comprehensive business context
        inventory_items = business_data.get('inventory', [])
        waste_data = business_data.get('food_waste', [])
        sales_data = business_data.get('sales', [])
        events_data = business_data.get('events', [])
        weather_data = business_data.get('weather', [])

        # Build detailed prompt
        prompt = f"""
You are a culinary business consultant for a restaurant/cafe. Provide structured JSON menu optimization suggestions.

**BUSINESS INTELLIGENCE DATA:**

🗑️ **Food Waste Analysis:**
- Total waste incidents: {len(waste_data)}
- High-waste items: {', '.join([w.item_id for w in waste_data[:3]]) if waste_data else 'None'}
- Total waste cost: ${sum(w.cost_impact for w in waste_data):.0f}

📦 **Inventory Challenges:**
- Low stock items: {', '.join([item.name for item in inventory_items[:3]]) if inventory_items else 'None'}
- Critical shortages: {len([item for item in inventory_items if item.current_stock <= 2])}

💰 **Sales Performance:**
- Top selling patterns: {len(sales_data)} recent transactions
- Revenue performance: {'Strong' if len(sales_data) > 40 else 'Moderate'}

🎉 **Upcoming Events (Next 14 Days):**
- Major events: {', '.join([event.name for event in events_data[:2]]) if events_data else 'None'}
- Expected attendance: {sum(event.expected_attendance or 0 for event in events_data)}

🌤️ **Weather Context:**
- Weather data points: {len(weather_data)}
- Current season: Winter/Spring transition

**REQUIRED: Return ONLY valid JSON in this exact format:**

{{
  "overall_strategy": "Brief 1-sentence summary of menu optimization approach",
  "total_estimated_impact": 2500,
  "implementation_timeline": "24-48 hours|1 week|1 month",
  "menu_suggestions": [
    {{
      "item_name": "Creative menu item name",
      "strategy_type": "waste_reduction|profit_maximization|event_special|seasonal|efficiency",
      "description": "Brief description of the item",
      "key_ingredients": ["ingredient1", "ingredient2", "ingredient3"],
      "profit_potential": 500,
      "cost_to_make": 8.50,
      "suggested_price": 15.00,
      "margin_percent": 43,
      "implementation": {{
        "prep_time": "30 minutes",
        "skill_level": "basic|intermediate|advanced",
        "equipment_needed": ["standard kitchen equipment"],
        "timing": "immediate|24 hours|48 hours"
      }},
      "target_audience": "event attendees|regular customers|weather-specific",
      "marketing_angle": "How to promote this item"
    }}
  ],
  "operational_benefits": [
    {{
      "benefit": "Specific operational improvement",
      "impact": "Quantified benefit description"
    }}
  ],
  "waste_reduction_impact": {{
    "items_utilized": ["waste item 1", "waste item 2"],
    "estimated_savings": 300
  }}
}}

Focus on 3-5 realistic menu items. Return ONLY the JSON, no other text or formatting.
"""

        try:
            response = self.model.generate_content(prompt)
            menu_analysis = response.text.strip()

            # Clean up the response and try to parse JSON
            # Remove any markdown formatting
            if "```json" in menu_analysis:
                menu_analysis = menu_analysis.split("```json")[1].split("```")[0].strip()
            elif "```" in menu_analysis:
                menu_analysis = menu_analysis.split("```")[1].split("```")[0].strip()

            try:
                import json
                parsed_menu = json.loads(menu_analysis)

                # Validate required fields
                if "menu_suggestions" not in parsed_menu:
                    parsed_menu["menu_suggestions"] = []
                if "overall_strategy" not in parsed_menu:
                    parsed_menu["overall_strategy"] = "Menu optimization analysis completed"

                return parsed_menu

            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "overall_strategy": "Menu analysis completed but JSON parsing failed",
                    "total_estimated_impact": 0,
                    "implementation_timeline": "24-48 hours",
                    "menu_suggestions": [],
                    "operational_benefits": [{"benefit": "Raw analysis available", "impact": "Review needed"}],
                    "waste_reduction_impact": {"items_utilized": [], "estimated_savings": 0},
                    "raw_response": menu_analysis[:300]  # First 300 chars for debugging
                }

        except Exception as e:
            return {
                "overall_strategy": "Menu optimization system unavailable",
                "total_estimated_impact": 0,
                "implementation_timeline": "unavailable",
                "menu_suggestions": [],
                "operational_benefits": [],
                "waste_reduction_impact": {"items_utilized": [], "estimated_savings": 0},
                "error": f"System error: {str(e)[:50]}"
            }

    def generate_daily_specials(self, current_inventory: List, weather_condition: str, day_of_week: str) -> List[str]:
        """Generate daily specials based on current conditions"""
        if not self.model:
            return ["Daily special: Chef's choice based on available ingredients"]

        prompt = f"""
Create 2-3 daily specials for a cafe/restaurant today:

**Today's Conditions:**
- Day: {day_of_week}
- Weather: {weather_condition}
- Available inventory: {', '.join([item.name for item in current_inventory[:5]]) if current_inventory else 'Standard items'}

Generate practical daily specials that:
1. Use available ingredients efficiently
2. Match today's weather and day of week
3. Have high profit margins
4. Are easy to execute in a busy kitchen

Format: "[Special Name] - [Brief description] - $[Price]"
"""

        try:
            response = self.model.generate_content(prompt)
            specials = response.text.strip().split('\n')
            return [special.strip() for special in specials if special.strip()][:3]
        except:
            return ["Today's Special: Market-fresh selection based on seasonal availability"]

# Singleton
menu_optimizer = LLMMenuOptimizer()