from pydantic import BaseModel, Field

from app.schemas.analytics import HistoricalAnalyticsResult


class PredictionWeights(BaseModel):
    frequency: float = Field(default=0.30, ge=0)
    recency: float = Field(default=0.25, ge=0)
    recurrence: float = Field(default=0.25, ge=0)
    marks_importance: float = Field(default=0.20, ge=0)


class PredictionFactors(BaseModel):
    frequency_score: float
    recency_score: float
    recurrence_score: float
    marks_importance_score: float

    frequency_contribution: float
    recency_contribution: float
    recurrence_contribution: float
    marks_importance_contribution: float


class TopicPrediction(BaseModel):
    rank: int
    topic_name: str
    prediction_score: float
    factors: PredictionFactors
    explanation: list[str]


class PredictionResult(BaseModel):
    weights: PredictionWeights
    total_topics: int
    recommendations: list[TopicPrediction]


class BacktestMatch(BaseModel):
    predicted_rank: int
    predicted_topic: str
    prediction_score: float
    actual_topic: str


class PredictionBacktestResult(BaseModel):
    top_k: int
    predicted_topics: list[str]
    actual_topics: list[str]
    hit_count: int
    hit_rate: float
    precision_at_k: float
    matches: list[BacktestMatch]
    missed_actual_topics: list[str]


class PredictionRequest(BaseModel):
    analytics: HistoricalAnalyticsResult
    weights: PredictionWeights = Field(default_factory=PredictionWeights)
    limit: int = Field(default=5, ge=1, le=20)


class PredictionBacktestRequest(BaseModel):
    analytics: HistoricalAnalyticsResult
    actual_topics: list[str]
    weights: PredictionWeights = Field(default_factory=PredictionWeights)
    top_k: int = Field(default=5, ge=1, le=20)
