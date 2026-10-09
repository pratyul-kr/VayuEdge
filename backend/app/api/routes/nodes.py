from fastapi import APIRouter
from app.schemas.node import NodesResponse
from app.services.node_service import node_service

router = APIRouter(tags=["Edge Nodes"])

@router.get("/nodes", response_model=NodesResponse)
def get_sensor_nodes():
    """
    List all distributed Edge AI nodes, their connectivity status, health, and key telemetry.
    """
    return node_service.get_nodes()
