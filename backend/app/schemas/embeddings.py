from pydantic import BaseModel


class SimilarityRequest(BaseModel):
    text_a: str
    text_b: str


class TextEmbedding(BaseModel):
    text: str
    embedding: list[float]


class SimilarityResult(BaseModel):
    text_a: str
    text_b: str
    similarity_score: float


class DuplicateQuestionPair(BaseModel):
    question_number_a: str | None = None
    question_a: str
    question_number_b: str | None = None
    question_b: str
    similarity_score: float
    is_duplicate: bool


class DuplicateDetectionResult(BaseModel):
    threshold: float
    total_questions: int
    total_pairs_checked: int
    total_duplicates: int
    duplicates: list[DuplicateQuestionPair]