from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

class SignalCategory(str, Enum):
    SOCIAL = "Social"
    EVENT = "Event"
    ECONOMIC = "Economic"
    CALENDAR = "Calendar"
    HEALTH = "Health"
    ENVIRONMENT = "Environment"

class InventoryCategory(str, Enum):
    BAKING = "Baking"
    BEVERAGES = "Beverages"
    DAIRY = "Dairy"
    PRODUCE = "Produce"
    PROTEINS = "Proteins"
    CONDIMENTS = "Condiments"
    FROZEN = "Frozen"
    SUPPLIES = "Supplies"
    BAKING_INGREDIENTS = "Baking Ingredients"

class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class RecommendationCategory(str, Enum):
    INVENTORY = "inventory"
    WEATHER = "weather"
    DEMAND = "demand"
    WASTE = "waste"
    PROMOTION = "promotion"

class IntelligenceSignalBase(BaseModel):
    name: str
    category: SignalCategory
    impact_description: str
    impact_value: Optional[float] = None
    details: Optional[Dict[str, Any]] = None
    active_date: Optional[datetime] = None

class IntelligenceSignalCreate(IntelligenceSignalBase):
    pass

class IntelligenceSignal(IntelligenceSignalBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class WeatherSensitivity(BaseModel):
    sunny: Optional[float] = None
    rainy: Optional[float] = None
    hot: Optional[float] = None
    cloudy: Optional[float] = None

class InventoryItemBase(BaseModel):
    item_id: str
    name: str
    category: InventoryCategory
    current_stock: float
    unit: str
    daily_usage: float
    cost_per_unit: float
    reorder_point: Optional[float] = None
    supplier: Optional[str] = None
    weather_sensitivity: Optional[WeatherSensitivity] = None
    sku: Optional[str] = None
    last_order_date: Optional[datetime] = None
    used_in: Optional[List[str]] = None
    ai_suggestion: Optional[float] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[InventoryCategory] = None
    current_stock: Optional[float] = None
    unit: Optional[str] = None
    daily_usage: Optional[float] = None
    cost_per_unit: Optional[float] = None
    reorder_point: Optional[float] = None
    supplier: Optional[str] = None
    weather_sensitivity: Optional[WeatherSensitivity] = None
    sku: Optional[str] = None
    last_order_date: Optional[datetime] = None
    used_in: Optional[List[str]] = None
    ai_suggestion: Optional[float] = None

class InventoryItem(InventoryItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class RecommendationBase(BaseModel):
    priority: Priority
    title: str
    description: str
    confidence: float = Field(..., ge=0, le=100)
    profit_impact: Optional[float] = None
    action_required: Optional[bool] = False
    category: Optional[RecommendationCategory] = None
    trigger_sources: Optional[List[str]] = None

class RecommendationCreate(RecommendationBase):
    pass

class Recommendation(RecommendationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True