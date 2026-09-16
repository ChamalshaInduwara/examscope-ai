import re

from collections import Counter

from app.schemas.documents import DocumentExtractionResult
from app.schemas.processing import (
    CleanedSegment,
    CleaningResult,
)


def clean_text(text: str) -> str:
    # Remove common invisible characters.
    text = text.replace("\ufeff", "")
    text = text.replace("\u200b", "")
    text = text.replace("\xa0", " ")

    # Normalize line endings.
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    cleaned_lines: list[str] = []

    for line in text.split("\n"):
        # Convert tabs/multiple spaces into one normal space.
        line = re.sub(r"[ \t]+", " ", line).strip()

        if line:
            cleaned_lines.append(line)

    return "\n".join(cleaned_lines)

def remove_repeated_edge_noise(
    document: CleaningResult,
) -> CleaningResult:
    if len(document.segments) < 2:
        return document

    # Header/footer detection is useful mainly for page/slide-based content.
    supported_reference_types = {"page", "slide"}

    if not all(
        segment.reference_type in supported_reference_types
        for segment in document.segments
    ):
        return document

    first_lines: list[str] = []
    last_lines: list[str] = []

    for segment in document.segments:
        lines = [
            line.strip()
            for line in segment.text.splitlines()
            if line.strip()
        ]

        if not lines:
            continue

        first_lines.append(lines[0])

        if len(lines) > 1:
            last_lines.append(lines[-1])

    first_line_counts = Counter(first_lines)
    last_line_counts = Counter(last_lines)

    minimum_repetitions = max(
        2,
        (len(document.segments) + 1) // 2,
    )

    repeated_headers = {
        line
        for line, count in first_line_counts.items()
        if count >= minimum_repetitions
    }

    repeated_footers = {
        line
        for line, count in last_line_counts.items()
        if count >= minimum_repetitions
    }

    cleaned_segments: list[CleanedSegment] = []
    full_text_parts: list[str] = []

    for segment in document.segments:
        lines = [
            line.strip()
            for line in segment.text.splitlines()
            if line.strip()
        ]

        if lines and lines[0] in repeated_headers:
            lines = lines[1:]

        if lines and lines[-1] in repeated_footers:
            lines = lines[:-1]

        cleaned_text = "\n".join(lines).strip()

        if not cleaned_text:
            continue

        cleaned_segments.append(
            CleanedSegment(
                reference_type=segment.reference_type,
                reference_number=segment.reference_number,
                text=cleaned_text,
            )
        )

        full_text_parts.append(cleaned_text)

    return CleaningResult(
        filename=document.filename,
        file_type=document.file_type,
        total_segments=len(cleaned_segments),
        full_text="\n\n".join(full_text_parts),
        segments=cleaned_segments,
    )


def clean_document(
    document: DocumentExtractionResult,
) -> CleaningResult:
    cleaned_segments: list[CleanedSegment] = []
    full_text_parts: list[str] = []

    for segment in document.segments:
        cleaned_text = clean_text(segment.text)

        if not cleaned_text:
            continue

        cleaned_segments.append(
            CleanedSegment(
                reference_type=segment.reference_type,
                reference_number=segment.reference_number,
                text=cleaned_text,
            )
        )

        full_text_parts.append(cleaned_text)

    result = CleaningResult(
        filename=document.filename,
        file_type=document.file_type,
        total_segments=len(cleaned_segments),
        full_text="\n\n".join(full_text_parts),
        segments=cleaned_segments,
    )

    return remove_repeated_edge_noise(result)