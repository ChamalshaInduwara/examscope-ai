import re

from app.schemas.processing import (
    CandidateQuestionBlock,
    CleaningResult,
    QuestionBlockResult,
    SourceReference,
)


PRIMARY_QUESTION_START_PATTERN = re.compile(
    r"^\s*(?:"
    r"(?:question|q)\s*[1-9]\d{0,2}[\.,]?"
    r"|"
    r"[1-9]\d{0,2}[\.,]"
    r")"
    r"(?:\s+|$)",
    re.IGNORECASE,
)

SUBQUESTION_PATTERN = re.compile(
    r"^\s*\("
    r"(?P<label>[a-z]|[ivxlcdm]+)"
    r"\)\s+"
    r"(?P<text>.+)$"
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

QUESTION_WORDS = (
    "what",
    "which",
    "who",
    "whom",
    "whose",
    "when",
    "where",
    "why",
    "how",
)


def looks_like_question(text: str) -> bool:
    stripped = text.strip()

    if not stripped:
        return False

    if stripped.endswith("?"):
        return True

    if PRIMARY_QUESTION_START_PATTERN.match(stripped):
        return True

    subquestion_match = SUBQUESTION_PATTERN.match(stripped)

    if subquestion_match:
        subquestion_text = (
            subquestion_match
            .group("text")
            .strip()
        )

        if subquestion_text.endswith("?"):
            return True

        words = re.findall(
            r"[A-Za-z]+",
            subquestion_text.lower(),
        )

        if words:
            first_word = words[0]
            return (
                first_word in COMMAND_VERBS
                or first_word in QUESTION_WORDS
            )

    words = re.findall(
        r"[A-Za-z]+",
        stripped.lower(),
    )

    if not words:
        return False

    first_word = words[0]

    return (
        first_word in COMMAND_VERBS
        or first_word in QUESTION_WORDS
    )


def is_standalone_question_number(
    text: str,
) -> bool:
    return bool(
        re.fullmatch(
            r"\s*(?:"
            r"(?:question|q)\s*[1-9]\d{0,2}[\.,]?"
            r"|"
            r"[1-9]\d{0,2}[\.,]"
            r")\s*",
            text,
            re.IGNORECASE,
        )
    )


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
                is_primary_start = bool(
                    PRIMARY_QUESTION_START_PATTERN.match(
                        line
                    )
                )

                is_subquestion_start = bool(
                    SUBQUESTION_PATTERN.match(line)
                )

                if (
                    current_block
                    and len(current_block) == 1
                    and is_standalone_question_number(
                        current_block[0]
                    )
                ):
                    current_block.append(line)
                    continue

                if (
                    current_block
                    and not is_primary_start
                    and not is_subquestion_start
                ):
                    current_block.append(line)
                    continue

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