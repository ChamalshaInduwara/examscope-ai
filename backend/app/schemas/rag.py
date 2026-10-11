"""Validated evidence and question contracts for the B9 HTTP/service layers."""
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

from app.schemas.processing import ChunkingResult, SourceReference

RAGMode = Literal["mcq", "structured", "essay"]
RAGDifficulty = Literal["easy", "medium", "hard"]
RAGStatus = Literal["success", "partial", "insufficient_evidence"]
NonBlank = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
PositiveMarks = Annotated[float, Field(gt=0, allow_inf_nan=False)]


class RetrievedEvidence(BaseModel):
    evidence_id: str
    filename: str
    chunk_index: int
    text: str
    relevance_score: float
    source_references: list[SourceReference]


class RetrievalResult(BaseModel):
    query: str
    total_candidate_chunks: int
    total_retrieved: int
    top_k: int
    minimum_relevance: float
    evidence: list[RetrievedEvidence]


class GenerationRequest(BaseModel):
    subject_name: Annotated[str, Field(max_length=200)] | None = None
    topic: Annotated[NonBlank, Field(max_length=500)]
    mode: RAGMode
    difficulty: RAGDifficulty = "medium"
    count: int = Field(default=5, ge=1, le=10)
    top_k: int = Field(default=5, ge=1, le=20)
    minimum_relevance: float = Field(default=0.25, ge=0, le=1)


class ChunkGenerationRequest(GenerationRequest):
    documents: list[ChunkingResult] = Field(
        min_length=1,
        max_length=3,
    )


class GeneratedModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class StudyAssistantRequest(BaseModel):
    documents: list[ChunkingResult] = Field(
        min_length=1,
        max_length=3,
    )
    question: Annotated[NonBlank, Field(max_length=1000)]
    subject_name: Annotated[str, Field(max_length=200)] | None = None
    top_k: int = Field(default=5, ge=1, le=20)
    minimum_relevance: float = Field(default=0.25, ge=0, le=1)


class StudyAssistantProviderResult(GeneratedModel):
    status: Literal[
        "success",
        "insufficient_evidence",
    ]
    answer: NonBlank | None = None
    source_evidence_ids: list[NonBlank] = Field(
        default_factory=list,
    )
    reason: NonBlank | None = None

    @model_validator(mode="after")
    def validate_status(self):
        if self.status == "success":
            if self.answer is None:
                raise ValueError(
                    "Successful responses require an answer"
                )
            if not self.source_evidence_ids:
                raise ValueError(
                    "Successful responses require evidence citations"
                )
        return self


class StudyAssistantResult(BaseModel):
    status: Literal[
        "success",
        "insufficient_evidence",
    ]
    question: str
    answer: str | None = None
    retrieved_evidence: list[RetrievedEvidence]
    source_evidence_ids: list[str] = Field(
        default_factory=list,
    )
    reason: str | None = None


class QuestionBase(GeneratedModel):
    question_text: NonBlank
    difficulty: RAGDifficulty
    explanation: NonBlank
    key_points: list[NonBlank] = Field(min_length=1)
    source_evidence_ids: list[NonBlank] = Field(min_length=1)


class MCQOption(GeneratedModel):
    label: Literal["A", "B", "C", "D"]
    text: NonBlank


class MCQQuestion(QuestionBase):
    marks: PositiveMarks
    options: list[MCQOption] = Field(min_length=4, max_length=4)
    correct_option: Literal["A", "B", "C", "D"]
    answer_text: NonBlank

    @model_validator(mode="after")
    def validate_options(self):
        if {option.label for option in self.options} != {"A", "B", "C", "D"}:
            raise ValueError("Options must have unique labels A, B, C and D")
        if len({option.text.casefold() for option in self.options}) != 4:
            raise ValueError("Option texts must be distinct")
        correct = next(o.text for o in self.options if o.label == self.correct_option)
        if self.answer_text.casefold() != correct.casefold():
            raise ValueError("answer_text must match the correct option text")
        return self


class StructuredPart(GeneratedModel):
    label: NonBlank
    question_text: NonBlank
    marks: PositiveMarks
    answer: NonBlank


class StructuredQuestion(QuestionBase):
    total_marks: PositiveMarks
    parts: list[StructuredPart] = Field(default_factory=list)
    answer_text: NonBlank
    marks_guidance: NonBlank

    @model_validator(mode="after")
    def validate_parts(self):
        if self.parts:
            if abs(sum(part.marks for part in self.parts) - self.total_marks) > 0.01:
                raise ValueError("Part marks must sum to total_marks")
            if len({part.label for part in self.parts}) != len(self.parts):
                raise ValueError("Part labels must be unique")
        return self


class EssayQuestion(QuestionBase):
    marks: PositiveMarks
    outline: list[NonBlank] = Field(min_length=1)
    model_answer: NonBlank
    marks_guidance: NonBlank


class ProviderResult(GeneratedModel):
    status: RAGStatus
    questions: list[dict] = Field(max_length=10)
    reason: NonBlank | None = None

    @model_validator(mode="after")
    def validate_status(self):
        if self.status == "insufficient_evidence" and self.questions:
            raise ValueError("Insufficient evidence cannot include questions")
        return self


class GenerationResult(BaseModel):
    status: RAGStatus
    mode: RAGMode
    requested_count: int
    generated_count: int
    topic: str
    difficulty: RAGDifficulty
    questions: list[MCQQuestion | StructuredQuestion | EssayQuestion]
    retrieved_evidence: list[RetrievedEvidence]
    reason: str | None = None
