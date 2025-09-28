#!/usr/bin/env python3
"""
Populate database with comprehensive sample data including new tables
"""

from datetime import date, datetime, timedelta
import random

from database import (
    SessionLocal, Base, engine,
    InventoryItem, IntelligenceSignal, Recommendation,
    FoodWaste, Weather, Event, Sale, Order
)
from models import (
    InventoryCategory, SignalCategory, Priority, RecommendationCategory,
    WasteReason, WeatherCondition, EventType, CustomerType, TimeOfDay, OrderStatus
)

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")

def populate_inventory_items(db):
    """Populate inventory items"""
    items = [
        InventoryItem(
            item_id="coffee_beans_premium",
            name="Premium Coffee Beans",
            category=InventoryCategory.BEVERAGES,
            current_stock=8.0,
            unit="kg",
            reorder_point=12.0,
            daily_usage=2.5,
            cost_per_unit=24.99,
            supplier="Coffee Roasters Inc"
        ),
        InventoryItem(
            item_id="milk_whole",
            name="Whole Milk",
            category=InventoryCategory.DAIRY,
            current_stock=5.0,
            unit="L",
            reorder_point=8.0,
            daily_usage=4.2,
            cost_per_unit=3.49,
            supplier="Local Dairy Co"
        ),
        InventoryItem(
            item_id="ice_cream_vanilla",
            name="Vanilla Ice Cream",
            category=InventoryCategory.FROZEN,
            current_stock=2.0,
            unit="L",
            reorder_point=5.0,
            daily_usage=1.8,
            cost_per_unit=8.99,
            supplier="Frozen Delights"
        ),
        InventoryItem(
            item_id="pastries_croissant",
            name="Fresh Croissants",
            category=InventoryCategory.BAKING,
            current_stock=25.0,
            unit="pieces",
            reorder_point=15.0,
            daily_usage=18.0,
            cost_per_unit=1.25,
            supplier="Bakery Supply Co"
        ),
        InventoryItem(
            item_id="chocolate_syrup",
            name="Chocolate Syrup",
            category=InventoryCategory.CONDIMENTS,
            current_stock=12.0,
            unit="bottles",
            reorder_point=8.0,
            daily_usage=2.1,
            cost_per_unit=4.99,
            supplier="Sweet Supplies"
        )
    ]

    for item in items:
        db.add(item)
    print(f"✅ Added {len(items)} inventory items")

def populate_food_waste(db):
    """Populate food waste records"""
    today = date.today()
    waste_records = []

    # Generate waste for last 7 days
    for i in range(7):
        waste_date = today - timedelta(days=i)

        # Random waste events
        waste_records.extend([
            FoodWaste(
                item_id="milk_whole",
                waste_date=waste_date,
                quantity_wasted=0.5,
                unit="L",
                reason=WasteReason.EXPIRED,
                cost_impact=1.75,
                prevention_notes="Better rotation needed"
            ),
            FoodWaste(
                item_id="pastries_croissant",
                waste_date=waste_date,
                quantity_wasted=3.0,
                unit="pieces",
                reason=WasteReason.OVERPRODUCTION,
                cost_impact=3.75,
                prevention_notes="Reduce daily production by 2-3 units"
            )
        ])

    # High waste event
    waste_records.append(
        FoodWaste(
            item_id="ice_cream_vanilla",
            waste_date=today - timedelta(days=2),
            quantity_wasted=2.0,
            unit="L",
            reason=WasteReason.DAMAGED,
            cost_impact=17.98,
            prevention_notes="Freezer temperature issue - check equipment"
        )
    )

    for waste in waste_records:
        db.add(waste)
    print(f"✅ Added {len(waste_records)} food waste records")

def populate_weather(db):
    """Populate weather data"""
    today = date.today()
    weather_records = []

    # Weather for last 7 days and next 3 days
    for i in range(-7, 4):
        weather_date = today + timedelta(days=i)

        # Simulate different weather patterns
        if i >= 0:  # Future weather
            if i == 1:  # Tomorrow - rainy
                weather_records.append(Weather(
                    date=weather_date,
                    temperature_high=65.0,
                    temperature_low=48.0,
                    condition=WeatherCondition.RAINY,
                    precipitation_chance=85.0,
                    humidity=78.0,
                    wind_speed=12.0,
                    weather_description="Heavy rain expected"
                ))
            elif i == 2:  # Day after - hot
                weather_records.append(Weather(
                    date=weather_date,
                    temperature_high=89.0,
                    temperature_low=72.0,
                    condition=WeatherCondition.SUNNY,
                    precipitation_chance=5.0,
                    humidity=35.0,
                    wind_speed=5.0,
                    weather_description="Hot and sunny"
                ))
            else:
                weather_records.append(Weather(
                    date=weather_date,
                    temperature_high=72.0,
                    temperature_low=55.0,
                    condition=WeatherCondition.CLOUDY,
                    precipitation_chance=20.0,
                    humidity=60.0,
                    wind_speed=8.0
                ))
        else:  # Past weather
            weather_records.append(Weather(
                date=weather_date,
                temperature_high=random.uniform(60, 80),
                temperature_low=random.uniform(45, 65),
                condition=random.choice([WeatherCondition.SUNNY, WeatherCondition.CLOUDY]),
                precipitation_chance=random.uniform(0, 30),
                humidity=random.uniform(40, 70),
                wind_speed=random.uniform(3, 15)
            ))

    for weather in weather_records:
        db.add(weather)
    print(f"✅ Added {len(weather_records)} weather records")

def populate_events(db):
    """Populate upcoming events"""
    today = date.today()
    events = [
        Event(
            name="Summer Music Festival",
            event_type=EventType.FESTIVAL,
            start_date=today + timedelta(days=3),
            end_date=today + timedelta(days=5),
            expected_attendance=2500,
            location_proximity="downtown",
            impact_multiplier=1.8,
            description="Large outdoor music festival downtown"
        ),
        Event(
            name="Local Marathon",
            event_type=EventType.SPORTS,
            start_date=today + timedelta(days=8),
            expected_attendance=800,
            location_proximity="nearby",
            impact_multiplier=1.3,
            description="Annual city marathon passing nearby"
        ),
        Event(
            name="Business Conference",
            event_type=EventType.CONFERENCE,
            start_date=today + timedelta(days=12),
            end_date=today + timedelta(days=14),
            expected_attendance=300,
            location_proximity="same_block",
            impact_multiplier=1.5,
            description="Tech conference at convention center"
        )
    ]

    for event in events:
        db.add(event)
    print(f"✅ Added {len(events)} events")

def populate_sales(db):
    """Populate sales data"""
    today = date.today()
    sales_records = []

    # Generate sales for last 30 days
    item_ids = ["coffee_beans_premium", "milk_whole", "ice_cream_vanilla", "pastries_croissant", "chocolate_syrup"]

    for i in range(30):
        sale_date = today - timedelta(days=i)

        # Generate 3-8 sales per day
        daily_sales = random.randint(3, 8)
        for _ in range(daily_sales):
            item_id = random.choice(item_ids)
            quantity = random.uniform(0.5, 5.0)
            unit_price = random.uniform(2.0, 15.0)

            sales_records.append(Sale(
                sale_date=sale_date,
                item_id=item_id,
                quantity_sold=round(quantity, 2),
                unit_price=round(unit_price, 2),
                total_amount=round(quantity * unit_price, 2),
                customer_type=random.choice([CustomerType.REGULAR, CustomerType.TOURIST, CustomerType.BUSINESS]),
                time_of_day=random.choice([TimeOfDay.MORNING, TimeOfDay.AFTERNOON, TimeOfDay.EVENING])
            ))

    for sale in sales_records:
        db.add(sale)
    print(f"✅ Added {len(sales_records)} sales records")

def populate_orders(db):
    """Populate order data"""
    today = date.today()
    orders = [
        # Pending order
        Order(
            order_date=today - timedelta(days=2),
            item_id="coffee_beans_premium",
            supplier="Coffee Roasters Inc",
            quantity_ordered=20.0,
            unit_cost=24.99,
            total_cost=499.80,
            expected_delivery=today + timedelta(days=2),
            status=OrderStatus.PENDING
        ),
        # Delayed order
        Order(
            order_date=today - timedelta(days=5),
            item_id="ice_cream_vanilla",
            supplier="Frozen Delights",
            quantity_ordered=10.0,
            unit_cost=8.99,
            total_cost=89.90,
            expected_delivery=today - timedelta(days=1),
            status=OrderStatus.DELAYED,
            notes="Supplier having delivery issues"
        ),
        # Delivered order
        Order(
            order_date=today - timedelta(days=7),
            item_id="pastries_croissant",
            supplier="Bakery Supply Co",
            quantity_ordered=100.0,
            unit_cost=1.25,
            total_cost=125.00,
            expected_delivery=today - timedelta(days=5),
            actual_delivery=today - timedelta(days=5),
            status=OrderStatus.DELIVERED
        ),
        # Another pending order that's overdue
        Order(
            order_date=today - timedelta(days=8),
            item_id="milk_whole",
            supplier="Local Dairy Co",
            quantity_ordered=15.0,
            unit_cost=3.49,
            total_cost=52.35,
            expected_delivery=today - timedelta(days=3),
            status=OrderStatus.PENDING,
            notes="Order overdue - need to follow up"
        )
    ]

    for order in orders:
        db.add(order)
    print(f"✅ Added {len(orders)} orders")

def populate_intelligence_signals(db):
    """Populate intelligence signals"""
    signals = [
        IntelligenceSignal(
            name="Weekend Festival Traffic",
            category=SignalCategory.EVENT,
            impact_description="Large music festival expected to increase foot traffic by 200%",
            impact_value=75.0,
            details={"event_type": "music_festival", "duration_days": 3}
        ),
        IntelligenceSignal(
            name="Coffee Bean Price Surge",
            category=SignalCategory.ECONOMIC,
            impact_description="Global coffee prices rising due to supply chain disruptions",
            impact_value=15.0,
            details={"price_increase_percent": 15, "duration_weeks": 8}
        ),
        IntelligenceSignal(
            name="Rainy Weather Pattern",
            category=SignalCategory.ENVIRONMENT,
            impact_description="Extended rainy period expected, increases demand for hot beverages",
            impact_value=25.0,
            active_date=datetime.now() + timedelta(days=1)
        )
    ]

    for signal in signals:
        db.add(signal)
    print(f"✅ Added {len(signals)} intelligence signals")

def main():
    """Main function to populate all data"""
    print("🚀 Populating Enhanced Kopik Database")
    print("=" * 50)

    # Create tables
    create_tables()

    # Populate data
    db = SessionLocal()
    try:
        populate_inventory_items(db)
        populate_food_waste(db)
        populate_weather(db)
        populate_events(db)
        populate_sales(db)
        populate_orders(db)
        populate_intelligence_signals(db)

        db.commit()
        print("\n🎉 Database populated successfully!")
        print("\nData Summary:")
        print(f"   - {db.query(InventoryItem).count()} inventory items")
        print(f"   - {db.query(FoodWaste).count()} food waste records")
        print(f"   - {db.query(Weather).count()} weather records")
        print(f"   - {db.query(Event).count()} events")
        print(f"   - {db.query(Sale).count()} sales records")
        print(f"   - {db.query(Order).count()} orders")
        print(f"   - {db.query(IntelligenceSignal).count()} intelligence signals")

    except Exception as e:
        print(f"❌ Error populating database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()