from typing import Dict, Any
from datetime import datetime, timezone
from app.services.simulation_service import sim_state
from app.ai.source_attribution import source_engine
from app.schemas.source import SourceAttributionResponse, SourceFactor, SourceCandidate

class SourceService:
    @classmethod
    def get_source_attribution(cls, node_id: str = "NODE-01") -> SourceAttributionResponse:
        node = sim_state.nodes_data.get(node_id, sim_state.nodes_data["NODE-01"])
        sensors = node["sensors"]
        now = datetime.now(timezone.utc)

        res = source_engine.attribute_source(sensors)

        evidence = [
            SourceFactor(
                sensor_name=item["sensor_name"],
                observed_level=item["observed_level"],
                weight_contribution=item["weight_contribution"],
                impact_description=item["impact_description"]
            )
            for item in res["supporting_evidence"]
        ]

        candidates = [
            SourceCandidate(
                category_id=cand["category_id"],
                name=cand["name"],
                probability=cand["probability"],
                is_primary=cand["is_primary"],
                evidence_match=cand["evidence_match"]
            )
            for cand in res["competing_candidates"]
        ]

        return SourceAttributionResponse(
            node_id=node["id"],
            timestamp=now.strftime("%Y-%m-%d %H:%M:%S UTC"),
            most_likely_source=res["most_likely_source"],
            category_id=res["category_id"],
            confidence=res["confidence"],
            is_estimated=True,
            explanation=res["explanation"],
            supporting_evidence=evidence,
            competing_candidates=candidates,
            fingerprint_notes=res["fingerprint_notes"]
        )

source_service = SourceService()
