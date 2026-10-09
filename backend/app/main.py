from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.db.database import engine, Base
import app.models # ensure all models register with Base

# Import API routes
from app.api.routes import (
    overview,
    sensors,
    forecast,
    sources,
    predictions,
    decisions,
    events,
    nodes,
    map as map_route,
    system
)
from app.websocket import sensor_stream

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Edge AI Air Pollution Intelligence Platform built for Arduino UNO Q. "
                "Delivers local offline sensing, sensor fusion, source attribution, forecasting, and explainable decision actuation.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api/v1
app.include_router(overview.router, prefix=settings.API_V1_STR)
app.include_router(sensors.router, prefix=settings.API_V1_STR)
app.include_router(forecast.router, prefix=settings.API_V1_STR)
app.include_router(sources.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(decisions.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(nodes.router, prefix=settings.API_V1_STR)
app.include_router(map_route.router, prefix=settings.API_V1_STR)
app.include_router(system.router, prefix=settings.API_V1_STR)

# Include WebSocket router
app.include_router(sensor_stream.router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "platform": settings.HARDWARE_PLATFORM,
        "mode": settings.EDGE_MODE,
        "version": settings.VERSION
    }

logger.info(f"Initialized {settings.PROJECT_NAME} for {settings.HARDWARE_PLATFORM}")
