from fastapi import APIRouter, HTTPException

from app.schemas.common import ErrorResponse
from app.schemas.predictions import (
    PredictionBacktestRequest,
    PredictionBacktestResult,
    PredictionGenerateRequest,
    PredictionGenerateResult,
    PredictionRequest,
    PredictionResult,
)
from app.services.prediction_service import (
    backtest_predictions,
    generate_predictions,
)


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


@router.post(
    "/rank",
    response_model=PredictionResult,
    summary="Rank topics using historical prediction factors",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid prediction parameters",
        },
    },
)
def rank_predictions(request: PredictionRequest):
    try:
        return generate_predictions(
            request.analytics,
            weights=request.weights,
            limit=request.limit,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


@router.post(
    "/backtest",
    response_model=PredictionBacktestResult,
    summary="Backtest predictions against held-out actual topics",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid backtest parameters",
        },
    },
)
def backtest_topic_predictions(
    request: PredictionBacktestRequest,
):
    try:
        return backtest_predictions(
            request.analytics,
            actual_topics=request.actual_topics,
            weights=request.weights,
            top_k=request.top_k,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc