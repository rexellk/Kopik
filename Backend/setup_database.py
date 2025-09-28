#!/usr/bin/env python3

import os
from database import engine, Base
from populate_database import populate_database

def setup_database():
    """Setup and populate the database with initial data"""
    print("Setting up database...")
    
    # Remove existing database file if it exists
    db_file = "kopik.db"
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"Removed existing database: {db_file}")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Created database tables")
    
    # Populate with data
    populate_database()

if __name__ == "__main__":
    setup_database()