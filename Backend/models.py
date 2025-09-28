from pydantic import BaseModel, Field
from datetime import datetime, date
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
    SALES = "sales"
    ORDERS = "orders"

class WasteReason(str, Enum):
    EXPIRED = "expired"
    DAMAGED = "damaged"
    OVERPRODUCTION = "overproduction"
    CONTAMINATED = "contaminated"
    CUSTOMER_RETURN = "customer_return"
    OTHER = "other"

class WeatherCondition(str, Enum):
    SUNNY = "sunny"
    RAINY = "rainy"
    CLOUDY = "cloudy"
    SNOWY = "snowy"
    STORMY = "stormy"
    FOGGY = "foggy"

class EventType(str, Enum):
    FESTIVAL = "festival"
    CONCERT = "concert"
    SPORTS = "sports"
    CONFERENCE = "conference"
    MARKET = "market"
    PARADE = "parade"
    OTHER = "other"

class CustomerType(str, Enum):
    REGULAR = "regular"
    TOURIST = "tourist"
    BUSINESS = "business"
    STUDENT = "student"
    OTHER = "other"

class TimeOfDay(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    DELAYED = "delayed"
    CANCELLED = "cancelled"

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
        from_attributes = True

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
        from_attributes = True

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
        from_attributes = True

# Food Waste Models
class FoodWasteBase(BaseModel):
    item_id: str
    waste_date: date
    quantity_wasted: float
    unit: str
    reason: WasteReason
    cost_impact: float
    prevention_notes: Optional[str] = None

class FoodWasteCreate(FoodWasteBase):
    pass

class FoodWaste(FoodWasteBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Weather Models
class WeatherBase(BaseModel):
    date: date
    temperature_high: float
    temperature_low: float
    condition: WeatherCondition
    precipitation_chance: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    weather_description: Optional[str] = None

class WeatherCreate(WeatherBase):
    pass

class Weather(WeatherBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Event Models
class EventBase(BaseModel):
    name: str
    event_type: EventType
    start_date: date
    end_date: Optional[date] = None
    expected_attendance: Optional[int] = None
    location_proximity: Optional[str] = None
    impact_multiplier: Optional[float] = 1.0
    description: Optional[str] = None

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Sale Models
class SaleBase(BaseModel):
    sale_date: date
    item_id: str
    quantity_sold: float
    unit_price: float
    total_amount: float
    customer_type: Optional[CustomerType] = None
    weather_condition: Optional[str] = None
    time_of_day: Optional[TimeOfDay] = None

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Order Models
class OrderBase(BaseModel):
    order_date: date
    item_id: str
    supplier: str
    quantity_ordered: float
    unit_cost: float
    total_cost: float
    expected_delivery: Optional[date] = None
    actual_delivery: Optional[date] = None
    status: OrderStatus = OrderStatus.PENDING
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    supplier: Optional[str] = None
    quantity_ordered: Optional[float] = None
    unit_cost: Optional[float] = None
    total_cost: Optional[float] = None
    expected_delivery: Optional[date] = None
    actual_delivery: Optional[date] = None
    status: Optional[OrderStatus] = None
    notes: Optional[str] = None

class Order(OrderBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True