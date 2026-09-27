from pydantic import BaseModel, Field


class PredictionQuestionInput(BaseModel):
    id: str
    text: str
    year: int | None = None
    question_type: str
    marks: int | None = None
    topic_id: str | None = None
    topic_name: str | None = None


class PredictionTopicInput(BaseModel):
    id: str
    name: str
    question_count: int = 0
    document_count: int = 0


class PredictionGenerateRequest(BaseModel):
    questions: list[PredictionQuestionInput]
    topics: list[PredictionTopicInput]

    max_predictions: int = Field(
        default=10,
        ge=1,
        le=30,
    )


class PredictionResult(BaseModel):
    title: str
    explanation: str

    score: float
    rank: int

    recurrence_score: float
    similarity_score: float
    recency_score: float
    importance_score: float

    topic_id: str | None = None
    topic_name: str | None = None


class PredictionGenerateResult(BaseModel):
    total_predictions: int
    predictions: list[PredictionResult]