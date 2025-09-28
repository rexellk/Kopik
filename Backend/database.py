from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()