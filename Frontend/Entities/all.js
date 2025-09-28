// Mock data and entity classes for the AI Inventory system

export class InventoryItem {
  constructor(data) {
    Object.assign(this, data);
  }

  static async list() {
    // Mock inventory data
    return [
      new InventoryItem({
        item_id: "1",
        name: "All-Purpose Flour",
        category: "Baking Ingredients",
        currentStock: 15,
        unit: "lbs",
        reorder_point: 10,
        daily_usage: 3,
        cost_per_unit: 2.50,
        supplier: "Local Mill Co",
        weather_sensitivity: { sunny: 1.0, rainy: 1.2, hot: 0.9, cloudy: 1.1 },
        sku: "FLOUR-001",
        last_order_date: "2024-01-15",
        used_in: ["Pastries", "Bread", "Cookies"],
        ai_suggestion: 25
      }),
      new InventoryItem({
        item_id: "2",
        name: "Premium Coffee Beans",
        category: "Beverages",
        currentStock: 8,
        unit: "lbs",
        reorder_point: 12,
        daily_usage: 4,
        cost_per_unit: 15.00,
        supplier: "Mountain Coffee Roasters",
        weather_sensitivity: { sunny: 0.8, rainy: 1.3, hot: 0.7, cloudy: 1.2 },
        sku: "COFFEE-001",
        last_order_date: "2024-01-10",
        used_in: ["Espresso", "Latte", "Americano"],
        ai_suggestion: 20
      }),
      new InventoryItem({
        item_id: "3",
        name: "Whole Milk",
        category: "Dairy",
        currentStock: 5,
        unit: "gallons",
        reorder_point: 8,
        daily_usage: 2,
        cost_per_unit: 4.20,
        supplier: "Fresh Dairy Farms",
        weather_sensitivity: { sunny: 1.2, rainy: 0.9, hot: 1.4, cloudy: 1.0 },
        sku: "MILK-001",
        last_order_date: "2024-01-12",
        used_in: ["Lattes", "Cappuccinos", "Baking"],
        ai_suggestion: 15
      }),
      new InventoryItem({
        item_id: "4",
        name: "Ice Cream Base",
        category: "Frozen",
        currentStock: 2,
        unit: "gallons",
        reorder_point: 4,
        daily_usage: 1.5,
        cost_per_unit: 8.75,
        supplier: "Creamy Delights",
        weather_sensitivity: { sunny: 2.0, rainy: 0.3, hot: 2.5, cloudy: 0.8 },
        sku: "ICE-001",
        last_order_date: "2024-01-08",
        used_in: ["Milkshakes", "Sundaes", "Floats"],
        ai_suggestion: 8
      }),
      new InventoryItem({
        item_id: "5",
        name: "Sugar",
        category: "Baking Ingredients",
        currentStock: 12,
        unit: "lbs",
        reorder_point: 8,
        daily_usage: 2,
        cost_per_unit: 1.80,
        supplier: "Sweet Supply Co",
        weather_sensitivity: { sunny: 1.0, rainy: 1.0, hot: 1.0, cloudy: 1.0 },
        sku: "SUGAR-001",
        last_order_date: "2024-01-14",
        used_in: ["Pastries", "Coffee", "Desserts"],
        ai_suggestion: 15
      })
    ];
  }
}

export class Recommendation {
  constructor(data) {
    Object.assign(this, data);
  }

  static async list() {
    return [
      new Recommendation({
        priority: "high",
        title: "Reorder Coffee Beans Immediately",
        description: "Current stock (8 lbs) is below reorder point (12 lbs). With daily usage of 4 lbs, you'll run out in 2 days.",
        profit_impact: 200,
        confidence: 96,
        action_required: true,
        category: "inventory",
        trigger_sources: ["Low Stock Alert", "Usage Pattern Analysis"]
      }),
      new Recommendation({
        priority: "medium",
        title: "Increase Ice Cream Base for Weekend",
        description: "Weather forecast shows sunny weekend ahead. Historical data shows 150% increase in cold dessert sales.",
        profit_impact: 320,
        confidence: 89,
        action_required: true,
        category: "weather",
        trigger_sources: ["Weather Forecast", "Historical Sales Data"]
      }),
      new Recommendation({
        priority: "low",
        title: "Optimize Milk Order Timing",
        description: "Consider ordering milk on Mondays instead of Fridays to ensure freshness during peak mid-week sales.",
        profit_impact: 45,
        confidence: 74,
        action_required: false,
        category: "inventory",
        trigger_sources: ["Sales Pattern Analysis", "Freshness Tracking"]
      })
    ];
  }
}

export class IntelligenceSignal {
  constructor(data) {
    Object.assign(this, data);
  }

  static async list() {
    return [
      new IntelligenceSignal({
        name: "Taylor Swift Concert",
        category: "Event",
        impact_description: "Major concert expected to drive 300% foot traffic increase",
        impact_value: 300,
        details: {
          venue: "Downtown Arena",
          expected_attendance: 50000,
          date: "2024-02-15",
          proximity: "0.5 miles"
        },
        active_date: "2024-02-15T19:00:00Z"
      }),
      new IntelligenceSignal({
        name: "Payday Cycle",
        category: "Economic",
        impact_description: "Mid-month payday increases premium product sales by 40%",
        impact_value: 40,
        details: {
          cycle_day: 15,
          affected_categories: ["Premium Coffee", "Desserts"],
          duration_days: 3
        },
        active_date: "2024-01-15T00:00:00Z"
      }),
      new IntelligenceSignal({
        name: "Local Marathon",
        category: "Event",
        impact_description: "Running event increases healthy option and hydration sales",
        impact_value: 120,
        details: {
          route_proximity: "Main Street",
          participants: 5000,
          start_time: "07:00"
        },
        active_date: "2024-01-20T07:00:00Z"
      }),
      new IntelligenceSignal({
        name: "New Year Resolutions",
        category: "Health",
        impact_description: "January health trends boost low-cal and organic sales",
        impact_value: 65,
        details: {
          trend_duration: "January-February",
          affected_items: ["Salads", "Smoothies", "Herbal Teas"]
        },
        active_date: "2024-01-01T00:00:00Z"
      })
    ];
  }
}