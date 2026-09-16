import re

from app.schemas.processing import (
    CandidateQuestionBlock,
    CleaningResult,
    QuestionBlockResult,
    SourceReference,
)


QUESTION_START_PATTERN = re.compile(
    r"^\s*(?:"
    r"(?:question|q)\s*\d+[\.\):\-]?"
    r"|"
    r"\d+[\.\):\-]"
    r"|"
    r"\([a-zA-Z]\)"
    r")\s+",
    re.IGNORECASE,
)


COMMAND_VERBS = (
    "define",
    "describe",
    "explain",
    "discuss",
    "compare",
    "contrast",
    "calculate",
    "evaluate",
    "analyse",
    "analyze",
    "state",
    "list",
    "outline",
    "identify",
    "justify",
    "derive",
    "solve",
)


def looks_like_question(text: str) -> bool:
    stripped = text.strip()

    if not stripped:
        return False

    if stripped.endswith("?"):
        return True

    if QUESTION_START_PATTERN.match(stripped):
        return True

    first_word = stripped.split(maxsplit=1)[0].lower()

    return first_word in COMMAND_VERBS


def detect_candidate_question_blocks(
    document: CleaningResult,
) -> QuestionBlockResult:
    blocks: list[CandidateQuestionBlock] = []
    block_index = 1

    for segment in document.segments:
        lines = [
            line.strip()
            for line in segment.text.splitlines()
            if line.strip()
        ]

        current_block: list[str] = []

        for line in lines:
            if looks_like_question(line):
                if current_block:
                    blocks.append(
                        CandidateQuestionBlock(
                            block_index=block_index,
                            text=" ".join(current_block),
                            source_reference=SourceReference(
                                reference_type=segment.reference_type,
                                reference_number=segment.reference_number,
                            ),
                        )
                    )

                    block_index += 1

                current_block = [line]

            elif current_block:
                current_block.append(line)

        if current_block:
            blocks.append(
                CandidateQuestionBlock(
                    block_index=block_index,
                    text=" ".join(current_block),
                    source_reference=SourceReference(
                        reference_type=segment.reference_type,
                        reference_number=segment.reference_number,
                    ),
                )
            )

            block_index += 1

    return QuestionBlockResult(
        filename=document.filename,
        file_type=document.file_type,
        total_blocks=len(blocks),
        blocks=blocks,
    )