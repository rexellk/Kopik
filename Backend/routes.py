from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import (
    get_db, 
    IntelligenceSignal as DBIntelligenceSignal,
    InventoryItem as DBInventoryItem,
    Recommendation as DBRecommendation
)
from models import (
    IntelligenceSignal, IntelligenceSignalCreate,
    InventoryItem, InventoryItemCreate, InventoryItemUpdate,
    Recommendation, RecommendationCreate
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