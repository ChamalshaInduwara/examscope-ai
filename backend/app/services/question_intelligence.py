import re

from app.schemas.processing import CleaningResult
from app.schemas.questions import (
    DifficultyLevel,
    QuestionIntelligenceResult,
    QuestionType,
    StructuredQuestion,
)
from app.services.question_block_detector import (
    detect_candidate_question_blocks,
)


QUESTION_NUMBER_PATTERN = re.compile(
    r"^\s*(?:question|q)?\s*"
    r"(?P<number>\d+(?:\([a-zA-Z]\))?)"
    r"[\.\),:\-]?\s*",
    re.IGNORECASE,
)

MARKS_PATTERN = re.compile(
    r"(?:"
    r"\[(?P<bracket_marks>\d+)\s*(?:marks?)?\]"
    r"|"
    r"\((?P<paren_marks>\d+)\s*marks?\)"
    r"|"
    r"(?P<plain_marks>\d+)\s*marks?"
    r")",
    re.IGNORECASE,
)

SECTION_PATTERN = re.compile(
    r"^\s*section\s+(?P<section>[A-Za-z0-9]+)",
    re.IGNORECASE,
)

YEAR_PATTERN = re.compile(
    r"\b(?P<year>(?:19|20)\d{2})\b"
)

PAGE_FOOTER_PATTERN = re.compile(
    r"\s*"
    r"(?:[\(\[]?\s*0{2,}\d{3,}\s*)?"
    r"\[?\s*see\s*page\b.*$",
    re.IGNORECASE,
)

WATERMARK_PATTERN = re.compile(
    r"\s*(?:downloaded\s+from\s*\|?\s*)?"
    r"past\s+papers\s+wiki\b.*$",
    re.IGNORECASE,
)

MCQ_INSTRUCTION_TAIL_PATTERN = re.compile(
    r"\s+[eE]?\s*For\s+each\s+of\s+the\s+questions\s+41\s+to\s+50\b.*$",
    re.IGNORECASE,
)

WRITE_IN_COLUMN_PATTERN = re.compile(
    r"""
    \bin\s+this
    (?:
        \s*
        (?:
            [|<.;:_-]+
            |o{1,3}
        )
        \s*
    )*
    column\b
    """,
    re.IGNORECASE | re.VERBOSE,
)

TRAILING_WRITE_IN_THIS_PATTERN = re.compile(
    r"""
    \s+
    \b(?:write|writs)
    (?:
        \s*[.,'"“”|;:_-]\s*
    )*
    \s*in\s+this
    (?:
        \s+(?:e{2,3}\s+)*column
    )?
    \s*$
    """,
    re.IGNORECASE | re.VERBOSE,
)

TRAILING_DOCUMENT_CODE_PATTERN = re.compile(
    r"\s*0{2,}\d{3,}\s*[.\-,:;]*\s*$"
)

SHORT_NOTES_PATTERN = re.compile(
    r"^write\s+short\s+notes?\s+on\s+the\s+following[.:]?\s*",
    re.IGNORECASE,
)

SHORT_NOTE_PART_PATTERN = re.compile(
    r"\((?P<label>[a-z])\)\s+"
)

TRAILING_OCR_SEPARATOR_PATTERN = re.compile(
    r"\s*(?:[|=]\s*)+$"
)

TRAILING_OCR_TOKEN_PATTERN = re.compile(
    r"\s+(?:i[}\]]|\|\s*x)\s*$",
    re.IGNORECASE,
)

TRAILING_OCR_NOISE_CLUSTER_PATTERN = re.compile(
    r"\s+[|.!;:,'\"}\]\sIix]*"
    r"e{2,}"
    r"[|.!;:,'\"}\]\sIix]*$",
    re.IGNORECASE,
)

TRAILING_OCR_GARBAGE_PATTERN = re.compile(
    r"""
    \s+
    (?:
        [~_=+\-|!;:'",.©\[\]{}()<>/?\\]
        |\b(?:re|ee|fie|o)\b
    )
    (?:
        \s*
        (?:
            [~_=+\-|!;:'",.©\[\]{}()<>/?\\]
            |\b(?:re|ee|fie|o)\b
        )
    ){2,}
    \s*$
    """,
    re.IGNORECASE | re.VERBOSE,
)

TRAILING_SYMBOL_NOISE_PATTERN = re.compile(
    r"\s*[;_]\s*$"
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


def extract_question_number(text: str) -> str | None:
    match = QUESTION_NUMBER_PATTERN.match(text)

    if not match:
        return None

    return match.group("number")


def extract_marks(text: str) -> int | None:
    match = MARKS_PATTERN.search(text)

    if not match:
        return None

    mark_value = (
        match.group("bracket_marks")
        or match.group("paren_marks")
        or match.group("plain_marks")
    )

    return int(mark_value)


def detect_section(text: str) -> str | None:
    match = SECTION_PATTERN.match(text.strip())

    if not match:
        return None

    return match.group("section").upper()


def detect_year(text: str) -> int | None:
    match = YEAR_PATTERN.search(text)

    if not match:
        return None

    return int(match.group("year"))


def clean_question_text(text: str) -> str:
    cleaned = QUESTION_NUMBER_PATTERN.sub("", text).strip()
    cleaned = MARKS_PATTERN.sub("", cleaned).strip()
    cleaned = PAGE_FOOTER_PATTERN.sub("", cleaned).strip()
    cleaned = WATERMARK_PATTERN.sub("", cleaned).strip()
    cleaned = MCQ_INSTRUCTION_TAIL_PATTERN.sub("", cleaned).strip()
    if WRITE_IN_COLUMN_PATTERN.search(cleaned):
        cleaned = re.sub(
            r"(?:[|/\\]\s*)?\bwrite\b\s*",
            " ",
            cleaned,
            count=1,
            flags=re.IGNORECASE,
        )
        cleaned = WRITE_IN_COLUMN_PATTERN.sub(
            "",
            cleaned,
        ).strip()
    cleaned = TRAILING_WRITE_IN_THIS_PATTERN.sub("", cleaned).strip()
    cleaned = TRAILING_DOCUMENT_CODE_PATTERN.sub("", cleaned).strip()
    cleaned = TRAILING_OCR_SEPARATOR_PATTERN.sub("", cleaned).strip()
    cleaned = TRAILING_OCR_TOKEN_PATTERN.sub("", cleaned).strip()
    cleaned = TRAILING_OCR_NOISE_CLUSTER_PATTERN.sub("", cleaned).strip()
    cleaned = TRAILING_OCR_GARBAGE_PATTERN.sub("", cleaned).strip()
    cleaned = TRAILING_SYMBOL_NOISE_PATTERN.sub("", cleaned).strip()

    cleaned = re.sub(
        r"\s+",
        " ",
        cleaned,
    )

    return cleaned


def detect_command_verb(text: str) -> str | None:
    cleaned_text = QUESTION_NUMBER_PATTERN.sub("", text).strip()

    words = re.findall(
        r"[A-Za-z]+",
        cleaned_text.lower(),
    )

    for word in words[:5]:
        if word in COMMAND_VERBS:
            return word

    return None

def classify_question_type(
    text: str,
    command_verb: str | None,
) -> QuestionType:
    numeric_options = set(
        re.findall(r"\([1-5]\)", text)
    )
    letter_options = set(
        re.findall(r"\([A-E]\)", text)
    )

    if (
        len(numeric_options) >= 3
        or len(letter_options) >= 3
    ):
        return "mcq"

    if command_verb in {
        "calculate",
        "derive",
        "solve",
    }:
        return "calculation"

    if command_verb in {
        "discuss",
        "evaluate",
        "analyse",
        "analyze",
        "justify",
    }:
        return "essay"

    if command_verb in {
        "define",
        "state",
        "list",
        "identify",
    }:
        return "short_answer"

    if command_verb in {
        "describe",
        "explain",
        "compare",
        "contrast",
        "outline",
    }:
        return "structured"

    return "unknown"


def estimate_difficulty(
    text: str,
    marks: int | None,
    command_verb: str | None,
) -> DifficultyLevel:
    if marks is not None:
        if marks <= 3:
            return "easy"

        if marks <= 8:
            return "medium"

        return "hard"

    if command_verb in {
        "define",
        "state",
        "list",
        "identify",
    }:
        return "easy"

    if command_verb in {
        "describe",
        "explain",
        "compare",
        "contrast",
        "outline",
    }:
        return "medium"

    if command_verb in {
        "discuss",
        "evaluate",
        "analyse",
        "analyze",
        "justify",
        "derive",
        "solve",
        "calculate",
    }:
        return "hard"

    return "unknown"


def is_meaningful_question_text(text: str) -> bool:
    words = re.findall(
        r"[A-Za-z]{2,}",
        text,
    )

    return len(words) >= 3


def split_short_note_parts(text: str) -> list[str]:
    if not SHORT_NOTES_PATTERN.match(text):
        return [text]

    matches = list(
        SHORT_NOTE_PART_PATTERN.finditer(text)
    )

    if len(matches) < 2:
        return [text]

    parts: list[str] = []
    for index, match in enumerate(matches):
        start = match.start()
        end = (
            matches[index + 1].start()
            if index + 1 < len(matches)
            else len(text)
        )
        part = text[start:end].strip()
        if part:
            parts.append(part)

    return parts or [text]


def analyze_questions(
    document: CleaningResult,
    year: int | None = None,
) -> QuestionIntelligenceResult:
    detected_year = year or detect_year(document.full_text)
    structured_questions: list[StructuredQuestion] = []

    question_blocks = detect_candidate_question_blocks(document)
    pending_short_notes_number: str | None = None

    for block in question_blocks.blocks:
        text = block.text.strip()

        if not text:
            continue

        question_number = extract_question_number(text)
        marks = extract_marks(text)
        command_verb = detect_command_verb(text)

        question_type = classify_question_type(
            text,
            command_verb,
        )

        difficulty = estimate_difficulty(
            text,
            marks,
            command_verb,
        )

        cleaned_text = clean_question_text(text)
        is_short_note_split = False
        if (
            SHORT_NOTES_PATTERN.match(cleaned_text)
            and len(split_short_note_parts(cleaned_text)) == 1
        ):
            pending_short_notes_number = question_number
            continue

        if (
            pending_short_notes_number is not None
            and cleaned_text.lstrip().lower().startswith("(a)")
        ):
            combined_short_notes = (
                "Write short notes on the following. "
                + cleaned_text
            )
            question_texts = split_short_note_parts(
                combined_short_notes
            )
            question_number = pending_short_notes_number
            pending_short_notes_number = None
            is_short_note_split = True
        else:
            question_texts = split_short_note_parts(
                cleaned_text
            )
            if len(question_texts) > 1:
                is_short_note_split = True
            pending_short_notes_number = None

        for index, question_text in enumerate(question_texts):
            question_text = clean_question_text(question_text)

            if not question_text.strip():
                continue

            part_question_number = (
                question_number
                if index == 0
                else None
            )

            if not question_text:
                continue

            if (
                not is_short_note_split
                and not is_meaningful_question_text(
                    question_text
                )
            ):
                continue

            structured_questions.append(
                StructuredQuestion(
                    question_number=part_question_number,
                    text=question_text,
                    marks=marks,
                    section=None,
                    command_verb=command_verb,
                    question_type=question_type,
                    difficulty=difficulty,
                    source_reference=block.source_reference,
                )
            )

    return QuestionIntelligenceResult(
        filename=document.filename,
        file_type=document.file_type,
        year=detected_year,
        total_questions=len(structured_questions),
        questions=structured_questions,
    )