from typing import Literal

from pydantic import BaseModel


ReferenceType = Literal["line", "page", "paragraph", "slide"]


class DocumentSegment(BaseModel):
    reference_type: ReferenceType
    reference_number: int
    text: str


class DocumentExtractionResult(BaseModel):
    filename: str
    file_type: str
    total_segments: int
    full_text: str
    segments: list[DocumentSegment]