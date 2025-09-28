from uagents import Agent, Context, Model
from typing import List, Dict, Any
import requests
from datetime import datetime
import asyncio
from sqlalchemy.orm import Session

# Import your existing database models
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db, InventoryItem as DBInventoryItem, IntelligenceSignal as DBIntelligenceSignal, Recommendation as DBRecommendation
from models import RecommendationCreate, Priority, RecommendationCategory

# Pydantic models for agent communication
class AnalysisRequest(Model):
    """Request model for intelligence analysis"""
    use_api: bool = False
    api_base_url: str = "http://localhost:8000"

class AlertData(Model):
    """Model for alert information"""
    type: str
    message: str
    priority: Priority
    category: RecommendationCategory

class SolutionData(Model):
    """Model for solution recommendations"""
    description: str
    confidence: float
    profit_impact: float = None

class AnalysisResponse(Model):
    """Response model for intelligence analysis"""
    summary: str
    alerts: List[AlertData]
    solutions: List[SolutionData]
    data_source: str
    timestamp: str

# Create the intelligence agent
intelligence_agent = Agent(
    name="kopik_intelligence_agent",
    seed="kopik_intelligence_seed_123",
    port=8001,
    endpoint=["http://localhost:8001/submit"]
)

@intelligence_agent.on_startup()
async def startup(ctx: Context):
    """Initialize agent on startup"""
    ctx.logger.info("Kopik Intelligence Agent starting up...")
    ctx.storage.set("analysis_count", 0)

@intelligence_agent.on_message(AnalysisRequest)
async def handle_analysis_request(ctx: Context, sender: str, msg: AnalysisRequest):
    """Handle intelligence analysis requests"""
    ctx.logger.info(f"Received analysis request from {sender}")

    try:
        if msg.use_api:
            data = await fetch_from_api(msg.api_base_url)
        else:
            data = await fetch_from_database()

        alerts = []
        solutions = []

        # Process different data types
        await process_inventory(data.get('inventory', []), alerts, solutions, ctx)
        await process_intelligence_signals(data.get('intelligence_signals', []), alerts, solutions, ctx)
        await process_existing_recommendations(data.get('recommendations', []), alerts, solutions, ctx)

        # Generate new recommendations in database
        await store_recommendations(solutions, ctx)

        summary = generate_summary(alerts)

        response = AnalysisResponse(
            summary=summary,
            alerts=alerts,
            solutions=solutions,
            data_source="API" if msg.use_api else "Database",
            timestamp=datetime.now().isoformat()
        )

        # Update analysis count
        count = ctx.storage.get("analysis_count") or 0
        ctx.storage.set("analysis_count", count + 1)

        await ctx.send(sender, response)

    except Exception as e:
        ctx.logger.error(f"Error during analysis: {str(e)}")
        error_response = AnalysisResponse(
            summary=f"Analysis failed: {str(e)}",
            alerts=[],
            solutions=[],
            data_source="Error",
            timestamp=datetime.now().isoformat()
        )
        await ctx.send(sender, error_response)

async def fetch_from_database() -> Dict[str, Any]:
    """Fetch data directly from the database"""
    db = next(get_db())
    try:
        # Get low stock items
        low_stock_items = db.query(DBInventoryItem).filter(
            DBInventoryItem.current_stock <= DBInventoryItem.reorder_point
        ).all()

        # Get recent intelligence signals
        intelligence_signals = db.query(DBIntelligenceSignal).order_by(
            DBIntelligenceSignal.created_at.desc()
        ).limit(50).all()

        # Get high priority recommendations
        recommendations = db.query(DBRecommendation).filter(
            DBRecommendation.priority == Priority.HIGH
        ).all()

        return {
            "inventory": [item.__dict__ for item in low_stock_items],
            "intelligence_signals": [signal.__dict__ for signal in intelligence_signals],
            "recommendations": [rec.__dict__ for rec in recommendations]
        }
    finally:
        db.close()

async def fetch_from_api(api_base_url: str) -> Dict[str, Any]:
    """Fetch data from API endpoints"""
    try:
        inventory_response = requests.get(f"{api_base_url}/api/inventory-items/low-stock/")
        signals_response = requests.get(f"{api_base_url}/api/intelligence-signals/")
        recommendations_response = requests.get(f"{api_base_url}/api/recommendations/high-priority/")

        return {
            "inventory": inventory_response.json(),
            "intelligence_signals": signals_response.json(),
            "recommendations": recommendations_response.json()
        }
    except Exception as e:
        raise Exception(f"API fetch failed: {str(e)}")

async def process_inventory(inventory: List[Dict], alerts: List[AlertData], solutions: List[SolutionData], ctx: Context):
    """Process inventory data for alerts and solutions"""
    for item in inventory:
        # Skip SQLAlchemy internal attributes
        if isinstance(item, dict) and item.get('name'):
            current_stock = item.get('current_stock', 0)
            reorder_point = item.get('reorder_point', 0)
            name = item.get('name', 'Unknown item')

            if current_stock <= reorder_point:
                alerts.append(AlertData(
                    type="low_stock",
                    message=f"Low stock: {name} ({current_stock} units remaining)",
                    priority=Priority.HIGH if current_stock == 0 else Priority.MEDIUM,
                    category=RecommendationCategory.INVENTORY
                ))

                solutions.append(SolutionData(
                    description=f"Reorder {name} immediately or source from alternative supplier",
                    confidence=85.0,
                    profit_impact=item.get('cost_per_unit', 0) * item.get('daily_usage', 1) * 7
                ))

async def process_intelligence_signals(signals: List[Dict], alerts: List[AlertData], solutions: List[SolutionData], ctx: Context):
    """Process intelligence signals for actionable insights"""
    for signal in signals:
        if isinstance(signal, dict) and signal.get('name'):
            category = signal.get('category', '').lower()
            name = signal.get('name', 'Unknown signal')
            impact_description = signal.get('impact_description', '')

            if 'weather' in category.lower() or 'environment' in category.lower():
                await process_weather_signal(signal, alerts, solutions)
            elif 'event' in category.lower() or 'social' in category.lower():
                await process_event_signal(signal, alerts, solutions)
            elif 'economic' in category.lower():
                await process_economic_signal(signal, alerts, solutions)

async def process_weather_signal(signal: Dict, alerts: List[AlertData], solutions: List[SolutionData]):
    """Process weather-related signals"""
    name = signal.get('name', '').lower()
    impact_description = signal.get('impact_description', '')

    if 'rain' in name or 'rain' in impact_description.lower():
        alerts.append(AlertData(
            type="weather",
            message=f"Weather alert: {signal.get('name')} - {impact_description}",
            priority=Priority.MEDIUM,
            category=RecommendationCategory.WEATHER
        ))
        solutions.append(SolutionData(
            description="Increase warm beverage inventory and comfort food items",
            confidence=75.0,
            profit_impact=500.0
        ))
    elif 'hot' in name or 'heat' in name:
        alerts.append(AlertData(
            type="weather",
            message=f"Hot weather expected: {signal.get('name')}",
            priority=Priority.MEDIUM,
            category=RecommendationCategory.WEATHER
        ))
        solutions.append(SolutionData(
            description="Stock up on cold beverages and light meal options",
            confidence=80.0,
            profit_impact=300.0
        ))

async def process_event_signal(signal: Dict, alerts: List[AlertData], solutions: List[SolutionData]):
    """Process event-related signals"""
    alerts.append(AlertData(
        type="event",
        message=f"Event impact: {signal.get('name')} - {signal.get('impact_description')}",
        priority=Priority.HIGH,
        category=RecommendationCategory.DEMAND
    ))
    solutions.append(SolutionData(
        description="Increase overall inventory by 30% and prepare quick-serve items",
        confidence=90.0,
        profit_impact=1000.0
    ))

async def process_economic_signal(signal: Dict, alerts: List[AlertData], solutions: List[SolutionData]):
    """Process economic signals"""
    alerts.append(AlertData(
        type="economic",
        message=f"Economic factor: {signal.get('name')} - {signal.get('impact_description')}",
        priority=Priority.MEDIUM,
        category=RecommendationCategory.DEMAND
    ))
    solutions.append(SolutionData(
        description="Adjust pricing strategy and inventory mix based on economic conditions",
        confidence=70.0,
        profit_impact=200.0
    ))

async def process_existing_recommendations(recommendations: List[Dict], alerts: List[AlertData], solutions: List[SolutionData], ctx: Context):
    """Process existing high-priority recommendations"""
    for rec in recommendations:
        if isinstance(rec, dict) and rec.get('priority') == Priority.HIGH:
            alerts.append(AlertData(
                type="recommendation",
                message=f"High priority: {rec.get('title', 'Unknown recommendation')}",
                priority=Priority.HIGH,
                category=RecommendationCategory.INVENTORY
            ))

async def store_recommendations(solutions: List[SolutionData], ctx: Context):
    """Store new recommendations in the database"""
    db = next(get_db())
    try:
        for solution in solutions:
            recommendation = RecommendationCreate(
                priority=Priority.MEDIUM,
                title="AI Agent Recommendation",
                description=solution.description,
                confidence=solution.confidence,
                profit_impact=solution.profit_impact,
                action_required=True,
                category=RecommendationCategory.INVENTORY,
                trigger_sources=["intelligence_agent"]
            )

            db_recommendation = DBRecommendation(**recommendation.dict())
            db.add(db_recommendation)

        db.commit()
    except Exception as e:
        ctx.logger.error(f"Error storing recommendations: {str(e)}")
        db.rollback()
    finally:
        db.close()

def generate_summary(alerts: List[AlertData]) -> str:
    """Generate a summary of alerts"""
    high_priority = len([a for a in alerts if a.priority == Priority.HIGH])
    medium_priority = len([a for a in alerts if a.priority == Priority.MEDIUM])

    return f"Analysis complete: {high_priority} high priority and {medium_priority} medium priority alerts detected"

@intelligence_agent.on_interval(period=300.0)  # Run every 5 minutes
async def periodic_analysis(ctx: Context):
    """Perform periodic intelligence analysis"""
    ctx.logger.info("Running periodic intelligence analysis...")

    request = AnalysisRequest(use_api=False)
    await handle_analysis_request(ctx, "periodic_scheduler", request)

if __name__ == "__main__":
    intelligence_agent.run()