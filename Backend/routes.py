from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import (
    get_db,
    IntelligenceSignal as DBIntelligenceSignal,
    InventoryItem as DBInventoryItem,
    Recommendation as DBRecommendation,
    FoodWaste as DBFoodWaste,
    Weather as DBWeather,
    Event as DBEvent,
    Sale as DBSale,
    Order as DBOrder
)
from models import (
    IntelligenceSignal, IntelligenceSignalCreate,
    InventoryItem, InventoryItemCreate, InventoryItemUpdate,
    Recommendation, RecommendationCreate,
    FoodWaste, FoodWasteCreate,
    Weather, WeatherCreate,
    Event, EventCreate,
    Sale, SaleCreate,
    Order, OrderCreate, OrderUpdate,
    Priority, RecommendationCategory
)

router = APIRouter()

@router.post("/intelligence-signals/", response_model=IntelligenceSignal)
def create_intelligence_signal(signal: IntelligenceSignalCreate, db: Session = Depends(get_db)):
    db_signal = DBIntelligenceSignal(**signal.dict())
    db.add(db_signal)
    db.commit()
    db.refresh(db_signal)
    return db_signal

@router.get("/intelligence-signals/", response_model=List[IntelligenceSignal])
def read_intelligence_signals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    signals = db.query(DBIntelligenceSignal).offset(skip).limit(limit).all()
    return signals

@router.get("/intelligence-signals/{signal_id}", response_model=IntelligenceSignal)
def read_intelligence_signal(signal_id: int, db: Session = Depends(get_db)):
    signal = db.query(DBIntelligenceSignal).filter(DBIntelligenceSignal.id == signal_id).first()
    if signal is None:
        raise HTTPException(status_code=404, detail="Intelligence signal not found")
    return signal

@router.post("/inventory-items/", response_model=InventoryItem)
def create_inventory_item(item: InventoryItemCreate, db: Session = Depends(get_db)):
    existing_item = db.query(DBInventoryItem).filter(DBInventoryItem.item_id == item.item_id).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="Item ID already exists")
    
    item_dict = item.dict()
    if item_dict.get('weather_sensitivity'):
        item_dict['weather_sensitivity'] = item_dict['weather_sensitivity'].dict() if hasattr(item_dict['weather_sensitivity'], 'dict') else item_dict['weather_sensitivity']
    
    db_item = DBInventoryItem(**item_dict)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/inventory-items/", response_model=List[InventoryItem])
def read_inventory_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(DBInventoryItem).offset(skip).limit(limit).all()
    return items

@router.get("/inventory-items/{item_id}", response_model=InventoryItem)
def read_inventory_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(DBInventoryItem).filter(DBInventoryItem.item_id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.put("/inventory-items/{item_id}", response_model=InventoryItem)
def update_inventory_item(item_id: str, item_update: InventoryItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(DBInventoryItem).filter(DBInventoryItem.item_id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_data = item_update.dict(exclude_unset=True)
    if 'weather_sensitivity' in update_data and update_data['weather_sensitivity']:
        update_data['weather_sensitivity'] = update_data['weather_sensitivity'].dict() if hasattr(update_data['weather_sensitivity'], 'dict') else update_data['weather_sensitivity']
    
    for field, value in update_data.items():
        setattr(db_item, field, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/inventory-items/{item_id}")
def delete_inventory_item(item_id: str, db: Session = Depends(get_db)):
    db_item = db.query(DBInventoryItem).filter(DBInventoryItem.item_id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Inventory item deleted successfully"}

@router.get("/inventory-items/low-stock/", response_model=List[InventoryItem])
def get_low_stock_items(db: Session = Depends(get_db)):
    items = db.query(DBInventoryItem).filter(
        DBInventoryItem.current_stock <= DBInventoryItem.reorder_point
    ).all()
    return items

@router.post("/recommendations/", response_model=Recommendation)
def create_recommendation(recommendation: RecommendationCreate, db: Session = Depends(get_db)):
    db_recommendation = DBRecommendation(**recommendation.dict())
    db.add(db_recommendation)
    db.commit()
    db.refresh(db_recommendation)
    return db_recommendation

@router.get("/recommendations/", response_model=List[Recommendation])
def read_recommendations(
    skip: int = 0, 
    limit: int = 100, 
    priority: str = None,
    category: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(DBRecommendation)
    
    if priority:
        query = query.filter(DBRecommendation.priority == priority)
    if category:
        query = query.filter(DBRecommendation.category == category)
    
    recommendations = query.offset(skip).limit(limit).all()
    return recommendations

@router.get("/recommendations/{recommendation_id}", response_model=Recommendation)
def read_recommendation(recommendation_id: int, db: Session = Depends(get_db)):
    recommendation = db.query(DBRecommendation).filter(DBRecommendation.id == recommendation_id).first()
    if recommendation is None:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return recommendation

@router.get("/recommendations/high-priority/", response_model=List[Recommendation])
def get_high_priority_recommendations(db: Session = Depends(get_db)):
    recommendations = db.query(DBRecommendation).filter(
        DBRecommendation.priority == "high"
    ).all()
    return recommendations

# Food Waste Routes
@router.post("/food-waste/", response_model=FoodWaste)
def create_food_waste(waste: FoodWasteCreate, db: Session = Depends(get_db)):
    db_waste = DBFoodWaste(**waste.dict())
    db.add(db_waste)
    db.commit()
    db.refresh(db_waste)
    return db_waste

@router.get("/food-waste/", response_model=List[FoodWaste])
def read_food_waste(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    waste_records = db.query(DBFoodWaste).offset(skip).limit(limit).all()
    return waste_records

@router.get("/food-waste/recent/", response_model=List[FoodWaste])
def get_recent_food_waste(days: int = 7, db: Session = Depends(get_db)):
    from datetime import date, timedelta
    cutoff_date = date.today() - timedelta(days=days)
    waste_records = db.query(DBFoodWaste).filter(
        DBFoodWaste.waste_date >= cutoff_date
    ).all()
    return waste_records

# Weather Routes
@router.post("/weather/", response_model=Weather)
def create_weather(weather: WeatherCreate, db: Session = Depends(get_db)):
    db_weather = DBWeather(**weather.dict())
    db.add(db_weather)
    db.commit()
    db.refresh(db_weather)
    return db_weather

@router.get("/weather/", response_model=List[Weather])
def read_weather(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    weather_records = db.query(DBWeather).order_by(DBWeather.date.desc()).offset(skip).limit(limit).all()
    return weather_records

@router.get("/weather/current/", response_model=Weather)
def get_current_weather(db: Session = Depends(get_db)):
    weather = db.query(DBWeather).order_by(DBWeather.date.desc()).first()
    if weather is None:
        raise HTTPException(status_code=404, detail="No weather data found")
    return weather

# Event Routes
@router.post("/events/", response_model=Event)
def create_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = DBEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/events/", response_model=List[Event])
def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    events = db.query(DBEvent).offset(skip).limit(limit).all()
    return events

@router.get("/events/upcoming/", response_model=List[Event])
def get_upcoming_events(days: int = 14, db: Session = Depends(get_db)):
    from datetime import date, timedelta
    today = date.today()
    future_date = today + timedelta(days=days)
    events = db.query(DBEvent).filter(
        DBEvent.start_date >= today,
        DBEvent.start_date <= future_date
    ).order_by(DBEvent.start_date).all()
    return events

# Sales Routes
@router.post("/sales/", response_model=Sale)
def create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    db_sale = DBSale(**sale.dict())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.get("/sales/", response_model=List[Sale])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sales = db.query(DBSale).order_by(DBSale.sale_date.desc()).offset(skip).limit(limit).all()
    return sales

@router.get("/sales/recent/", response_model=List[Sale])
def get_recent_sales(days: int = 7, db: Session = Depends(get_db)):
    from datetime import date, timedelta
    cutoff_date = date.today() - timedelta(days=days)
    sales = db.query(DBSale).filter(
        DBSale.sale_date >= cutoff_date
    ).order_by(DBSale.sale_date.desc()).all()
    return sales

@router.get("/sales/by-item/{item_id}", response_model=List[Sale])
def get_sales_by_item(item_id: str, days: int = 30, db: Session = Depends(get_db)):
    from datetime import date, timedelta
    cutoff_date = date.today() - timedelta(days=days)
    sales = db.query(DBSale).filter(
        DBSale.item_id == item_id,
        DBSale.sale_date >= cutoff_date
    ).order_by(DBSale.sale_date.desc()).all()
    return sales

# Order Routes
@router.post("/orders/", response_model=Order)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    db_order = DBOrder(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/orders/", response_model=List[Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(DBOrder).order_by(DBOrder.order_date.desc()).offset(skip).limit(limit).all()
    return orders

@router.get("/orders/pending/", response_model=List[Order])
def get_pending_orders(db: Session = Depends(get_db)):
    orders = db.query(DBOrder).filter(
        DBOrder.status.in_(["pending", "delayed"])
    ).order_by(DBOrder.order_date.desc()).all()
    return orders

@router.put("/orders/{order_id}", response_model=Order)
def update_order(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    db_order = db.query(DBOrder).filter(DBOrder.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    update_data = order_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)

    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/orders/{order_id}", response_model=Order)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(DBOrder).filter(DBOrder.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# AI Agent Intelligence Endpoints
@router.get("/intelligence/dashboard")
def get_intelligence_dashboard():
    """Get comprehensive business intelligence insights for dashboard"""
    try:
        import sys
        import os
        from datetime import datetime

        # Add agents directory to path
        agents_path = os.path.join(os.path.dirname(__file__), 'agents')
        if agents_path not in sys.path:
            sys.path.append(agents_path)

        from agents.enhanced_agent import EnhancedKopikAgent
        from models import Priority

        # Create agent and get data
        agent = EnhancedKopikAgent()
        data = agent.fetch_comprehensive_data()

        # Run analyses
        inventory_alerts, inventory_solutions = agent.analyze_inventory(data['inventory'])
        waste_alerts, waste_solutions = agent.analyze_food_waste(data['food_waste'])
        weather_alerts, weather_solutions = agent.analyze_weather_impact(data['weather'], data['sales'])
        event_alerts, event_solutions = agent.analyze_events(data['events'])
        order_alerts, order_solutions = agent.analyze_orders(data['orders'])
        
        # Combine results
        all_alerts = inventory_alerts + waste_alerts + weather_alerts + event_alerts + order_alerts
        all_solutions = inventory_solutions + waste_solutions + weather_solutions + event_solutions + order_solutions

        # Calculate metrics
        high_priority_count = len([a for a in all_alerts if a.get('priority') == Priority.HIGH.value])
        total_profit_impact = sum(s.get('profit_impact', 0) for s in all_solutions)

        # Format response
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_alerts": len(all_alerts),
                "high_priority_alerts": high_priority_count,
                "total_recommendations": len(all_solutions),
                "total_profit_impact": round(total_profit_impact, 2)
            },
            "alerts": [
                {
                    "id": i + 1,
                    "type": alert.get("type", "general"),
                    "title": alert.get("type", "general").replace("_", " ").title(),
                    "message": alert.get("message", ""),
                    "priority": str(alert.get("priority", "medium")).replace("Priority.", "").lower(),
                    "category": str(alert.get("category", "inventory")).replace("RecommendationCategory.", "").lower(),
                    "timestamp": datetime.now().isoformat(),
                    "actionable": True
                }
                for i, alert in enumerate(all_alerts[:10])  # Limit to top 10
            ],
            "recommendations": [
                {
                    "id": i + 1,
                    "title": solution.get("description", "")[:50] + "..." if len(solution.get("description", "")) > 50 else solution.get("description", ""),
                    "description": solution.get("description", ""),
                    "confidence": round(solution.get("confidence", 80), 1),
                    "profit_impact": round(solution.get("profit_impact", 0), 2),
                    "priority": solution.get("priority", "medium"),
                    "estimated_implementation": solution.get("estimated_implementation", "1-3 days"),
                    "tags": solution.get("tags", ["ai-generated"]),
                    "trigger_sources": solution.get("trigger_sources", [])
                }
                for i, solution in enumerate(all_solutions[:10])  # Limit to top 10
            ],
            "categories": {
                "inventory": {
                    "alerts_count": len([a for a in all_alerts if a.get('category') == RecommendationCategory.INVENTORY]),
                    "low_stock_items": len(data['inventory']),
                    "total_items": len(data['inventory']) + 10  # Assuming some non-low-stock items
                },
                "food_waste": {
                    "alerts_count": len([a for a in all_alerts if a.get('category') == RecommendationCategory.WASTE]),
                    "total_cost_impact": sum(w.cost_impact for w in data['food_waste']) if data['food_waste'] else 0,
                    "waste_records": len(data['food_waste'])
                },
                "weather": {
                    "alerts_count": len([a for a in all_alerts if a.get('category') == RecommendationCategory.WEATHER]),
                    "current_condition": data['weather'][0].condition.value if data['weather'] else "sunny",
                    "temperature": data['weather'][0].temperature_high if data['weather'] else 72.0
                },
                "events": {
                    "alerts_count": len([a for a in all_alerts if a.get('category') == RecommendationCategory.DEMAND]),
                    "upcoming_events": len(data['events']),
                    "total_expected_attendance": sum(e.expected_attendance or 0 for e in data['events'])
                },
                "sales": {
                    "alerts_count": len([a for a in all_alerts if a.get('category') == RecommendationCategory.SALES]),
                    "recent_sales": len(data['sales']),
                    "total_revenue": sum(s.total_amount for s in data['sales']) if data['sales'] else 0
                },
                "orders": {
                    "alerts_count": len([a for a in all_alerts if a.get('category') == RecommendationCategory.ORDERS]),
                    "pending_orders": len(data['orders']),
                    "total_order_value": sum(o.total_cost for o in data['orders']) if data['orders'] else 0
                }
            },
            "insights": [
                f"{high_priority_count} critical issues require immediate attention" if high_priority_count > 0 else "No critical issues detected",
                f"${total_profit_impact:.0f} in potential profit improvements identified",
                f"${sum(w.cost_impact for w in data['food_waste']):.0f} in food waste this week - prevention opportunities available" if data['food_waste'] else "No food waste recorded this week",
                f"{len(data['events'])} upcoming events with {sum(e.expected_attendance or 0 for e in data['events'])} expected attendees" if data['events'] else "No upcoming events scheduled",
                "Supply chain delays detected - alternative sourcing recommended" if any(o.status.value == "delayed" for o in data['orders']) else "Supply chain operating normally"
            ],
            "data_overview": {
                "low_stock_items": len(data['inventory']),
                "recent_waste_records": len(data['food_waste']),
                "upcoming_events": len(data['events']),
                "pending_orders": len(data['orders']),
                "last_updated": datetime.now().isoformat()
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intelligence analysis failed: {str(e)}")

@router.post("/intelligence/analyze")
def trigger_intelligence_analysis():
    """Trigger a fresh intelligence analysis and return summary"""
    try:
        import sys
        import os
        from datetime import datetime

        # Add agents directory to path
        agents_path = os.path.join(os.path.dirname(__file__), 'agents')
        if agents_path not in sys.path:
            sys.path.append(agents_path)

        from agents.enhanced_agent import EnhancedKopikAgent

        # Run analysis
        agent = EnhancedKopikAgent()
        success = agent.run_comprehensive_analysis()

        return {
            "success": success,
            "message": "Analysis completed successfully" if success else "Analysis failed",
            "timestamp": datetime.now().isoformat(),
            "analysis_count": agent.analysis_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis trigger failed: {str(e)}")