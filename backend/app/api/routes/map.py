from fastapi import APIRouter
from app.schemas.node import LocalMapResponse
from app.services.node_service import node_service

router = APIRouter(tags=["Hyperlocal Map"])

@router.get("/map", response_model=LocalMapResponse)
def get_pollution_map():
    """
    Hyperlocal pollution spatial grid with heatmap cells, localized nodes,
    highest polluted zones, and dispersion vector assessment.
    """
    return node_service.get_local_map()
