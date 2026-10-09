from fastapi import APIRouter, Query
from app.schemas.source import SourceAttributionResponse
from app.services.source_service import source_service

router = APIRouter(tags=["Source Attribution"])

@router.get("/sources", response_model=SourceAttributionResponse)
def get_sources(node_id: str = Query("NODE-01")):
    """
    Source attribution analysis exposing multi-pollutant fingerprinting,
    competing source likelihoods, and supporting sensor evidence factors.
    """
    return source_service.get_source_attribution(node_id=node_id)
