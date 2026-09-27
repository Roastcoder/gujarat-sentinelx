"""
Camera Simulator & Failure Injection Control (Section 47 & 51)
Enables CI/CD, evaluation resilience testing, and failure injection without touching production.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.simulator.camera_generator import inject_camera_failure, clear_camera_failures, _INJECTED_FAILURES
from app.services.stream_manager import stream_manager
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

class FailureInjectionRequest(BaseModel):
    camera_id: str  # e.g., cam01 or CAM-AHM-001
    failure_type: str  # offline, decoder_warning, pts_gap, scene_discontinuity
    enabled: bool = True

@router.post("/failure-injection")
async def trigger_failure_injection(
    body: FailureInjectionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Injects realistic failure modes:
    - offline: Marks camera offline in catalogue and drops stream
    - decoder_warning: Injects RPS/POC non-fatal warnings
    - pts_gap: Induces variable frame rate / network jitter
    - scene_discontinuity: Triggers loop point cut / tracker reset
    """
    inject_camera_failure(body.camera_id, body.failure_type, body.enabled)
    
    # Also notify active stream session if available
    session = stream_manager.get_session(body.camera_id)
    if session:
        if body.failure_type == "decoder_warning":
            session.handle_decoder_warning("Error constructing frame RPS / POC not found")
        elif body.failure_type == "scene_discontinuity":
            session._handle_pts_update(session.last_pts - 5000.0 if session.last_pts else 100.0)

    return {
        "status": "APPLIED",
        "camera_id": body.camera_id,
        "failure_type": body.failure_type,
        "enabled": body.enabled,
        "active_failures": _INJECTED_FAILURES
    }

@router.post("/failure-injection/clear")
async def clear_all_failures(
    current_user: User = Depends(get_current_user)
):
    """Clears all injected failures, returning all 50 cameras to healthy operational state."""
    clear_camera_failures()
    return {"status": "CLEARED", "active_failures": {}}

@router.get("/status")
async def get_simulator_status(
    current_user: User = Depends(get_current_user)
):
    """Returns active failure injection states and simulator telemetry."""
    return {
        "status": "OPERATIONAL",
        "total_simulated_cameras": 50,
        "active_failures": _INJECTED_FAILURES
    }
