from typing import Literal

from pydantic import BaseModel

from app.schemas.processing import SourceReference


QuestionType = Literal[
    "mcq",
    "structured",
    "essay",
    "calculation",
    "short_answer",
    "unknown",
]

DifficultyLevel = Literal[
    "easy",
    "medium",
    "hard",
    "unknown",
]


class StructuredQuestion(BaseModel):
    question_number: str | None = None
    text: str
    marks: int | None = None
    section: str | None = None
    command_verb: str | None = None
    question_type: QuestionType = "unknown"
    difficulty: DifficultyLevel = "unknown"
    source_reference: SourceReference


class QuestionIntelligenceResult(BaseModel):
    filename: str
    file_type: str
    year: int | None = None
    total_questions: int
    questions: list[StructuredQuestion]