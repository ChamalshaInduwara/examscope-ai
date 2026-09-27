from fastapi import APIRouter, HTTPException

from app.schemas.common import ErrorResponse
from app.schemas.predictions import (
    PredictionGenerateRequest,
    PredictionGenerateResult,
)
from app.services.prediction_service import generate_predictions


router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"],
)


@router.post(
    "/generate",
    response_model=PredictionGenerateResult,
    summary="Generate exam topic predictions",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid prediction input",
        },
    },
)
async def generate_exam_predictions(
    request: PredictionGenerateRequest,
):
    try:
        return generate_predictions(request)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc