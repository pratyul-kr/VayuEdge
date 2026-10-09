import os
from typing import List

class Settings:
    PROJECT_NAME: str = "AetherEdge Air Pollution Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./edge_pollution.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Hardware / Edge target info
    HARDWARE_PLATFORM: str = "Arduino UNO Q (Linux Core + STM32 Coprocessor)"
    EDGE_MODE: str = os.getenv("EDGE_MODE", "standalone") # standalone, gateway, mesh
    
    # Node settings
    DEFAULT_NODE_ID: str = "NODE-01"
    DEFAULT_NODE_NAME: str = "North Campus Gateway (UNO-Q)"
    LOCATION: str = "Innovation Quad / Traffic Perimeter"

settings = Settings()
