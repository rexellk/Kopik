from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routes import router
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kopik API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to Kopik API", "docs": "/docs", "api": "/api"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Kopik API is running"}

# Legacy endpoint removed - now using /api/intelligence/dashboard directly

# Mount static files directory
current_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=current_dir), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)