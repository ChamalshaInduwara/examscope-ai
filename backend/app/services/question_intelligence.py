import re

from app.schemas.processing import (
    CleaningResult,
    SourceReference,
)
from app.schemas.questions import (
    DifficultyLevel,
    QuestionIntelligenceResult,
    QuestionType,
    StructuredQuestion,
)
from app.services.question_block_detector import looks_like_question


QUESTION_NUMBER_PATTERN = re.compile(
    r"^\s*(?:question|q)?\s*"
    r"(?P<number>\d+(?:\([a-zA-Z]\))?)"
    r"[\.\):\-]?\s*",
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
    lowered = text.lower()

    if re.search(r"\b[a-d][\.\)]\s", lowered):
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


def analyze_questions(
    document: CleaningResult,
    year: int | None = None,
) -> QuestionIntelligenceResult:
    detected_year = year or detect_year(document.full_text)

    structured_questions: list[StructuredQuestion] = []

    current_section: str | None = None

    for segment in document.segments:
        lines = [
            line.strip()
            for line in segment.text.splitlines()
            if line.strip()
        ]

        for line in lines:
            section = detect_section(line)

            if section is not None:
                current_section = section
                continue

            if not looks_like_question(line):
                continue

            question_number = extract_question_number(line)
            marks = extract_marks(line)
            command_verb = detect_command_verb(line)

            question_type = classify_question_type(
                line,
                command_verb,
            )

            difficulty = estimate_difficulty(
                line,
                marks,
                command_verb,
            )

            question_text = clean_question_text(line)

            structured_questions.append(
                StructuredQuestion(
                    question_number=question_number,
                    text=question_text,
                    marks=marks,
                    section=current_section,
                    command_verb=command_verb,
                    question_type=question_type,
                    difficulty=difficulty,
                    source_reference=SourceReference(
                        reference_type=segment.reference_type,
                        reference_number=segment.reference_number,
                    ),
                )
            )

    return QuestionIntelligenceResult(
        filename=document.filename,
        file_type=document.file_type,
        year=detected_year,
        total_questions=len(structured_questions),
        questions=structured_questions,
    )