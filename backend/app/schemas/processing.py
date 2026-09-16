from pydantic import BaseModel

from app.schemas.documents import ReferenceType


class CleanedSegment(BaseModel):
    reference_type: ReferenceType
    reference_number: int
    text: str


class CleaningResult(BaseModel):
    filename: str
    file_type: str
    total_segments: int
    full_text: str
    segments: list[CleanedSegment]


class SourceReference(BaseModel):
    reference_type: ReferenceType
    reference_number: int


class TextChunk(BaseModel):
    chunk_index: int
    text: str
    word_count: int
    source_references: list[SourceReference]


class ChunkingResult(BaseModel):
    filename: str
    file_type: str
    total_chunks: int
    chunk_size_words: int
    overlap_words: int
    chunks: list[TextChunk]


class CandidateQuestionBlock(BaseModel):
    block_index: int
    text: str
    source_reference: SourceReference


class QuestionBlockResult(BaseModel):
    filename: str
    file_type: str
    total_blocks: int
    blocks: list[CandidateQuestionBlock]

class DocumentProcessingResult(BaseModel):
    cleaning: CleaningResult
    chunking: ChunkingResult
    question_blocks: QuestionBlockResult