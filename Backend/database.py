from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Boolean, JSON, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLITE_DATABASE_URL = "sqlite:///./kopik.db"

engine = create_engine(
    SQLITE_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class IntelligenceSignal(Base):
    __tablename__ = "intelligence_signals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    impact_description = Column(Text, nullable=False)
    impact_value = Column(Float, nullable=True)
    details = Column(JSON, nullable=True)
    active_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    current_stock = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    reorder_point = Column(Float, nullable=True)
    daily_usage = Column(Float, nullable=False)
    cost_per_unit = Column(Float, nullable=False)
    supplier = Column(String, nullable=True)
    weather_sensitivity = Column(JSON, nullable=True)
    sku = Column(String, nullable=True)
    last_order_date = Column(DateTime, nullable=True)
    used_in = Column(JSON, nullable=True)
    ai_suggestion = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    priority = Column(String, nullable=False)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    profit_impact = Column(Float, nullable=True)
    confidence = Column(Float, nullable=False)
    action_required = Column(Boolean, nullable=True, default=False)
    category = Column(String, nullable=True)
    trigger_sources = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FoodWaste(Base):
    __tablename__ = "food_waste"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String, ForeignKey("inventory_items.item_id"), nullable=False, index=True)
    waste_date = Column(Date, nullable=False, index=True)
    quantity_wasted = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    reason = Column(String, nullable=False)  # expired, damaged, overproduction, etc.
    cost_impact = Column(Float, nullable=False)
    prevention_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    inventory_item = relationship("InventoryItem", backref="waste_records")

class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    temperature_high = Column(Float, nullable=False)
    temperature_low = Column(Float, nullable=False)
    condition = Column(String, nullable=False)  # sunny, rainy, cloudy, snowy, etc.
    precipitation_chance = Column(Float, nullable=True)  # 0-100 percentage
    humidity = Column(Float, nullable=True)  # 0-100 percentage
    wind_speed = Column(Float, nullable=True)  # mph or km/h
    weather_description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)  # festival, concert, sports, conference, etc.
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True)
    expected_attendance = Column(Integer, nullable=True)
    location_proximity = Column(String, nullable=True)  # nearby, downtown, same_block, etc.
    impact_multiplier = Column(Float, nullable=True, default=1.0)  # expected business impact
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    sale_date = Column(Date, nullable=False, index=True)
    item_id = Column(String, ForeignKey("inventory_items.item_id"), nullable=False, index=True)
    quantity_sold = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    customer_type = Column(String, nullable=True)  # regular, tourist, business, etc.
    weather_condition = Column(String, nullable=True)
    time_of_day = Column(String, nullable=True)  # morning, afternoon, evening
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    inventory_item = relationship("InventoryItem", backref="sales_records")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_date = Column(Date, nullable=False, index=True)
    item_id = Column(String, ForeignKey("inventory_items.item_id"), nullable=False, index=True)
    supplier = Column(String, nullable=False)
    quantity_ordered = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    expected_delivery = Column(Date, nullable=True)
    actual_delivery = Column(Date, nullable=True)
    status = Column(String, nullable=False, default="pending")  # pending, delivered, delayed, cancelled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    inventory_item = relationship("InventoryItem", backref="order_records")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()