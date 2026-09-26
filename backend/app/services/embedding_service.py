from functools import lru_cache

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas.embeddings import (
    DuplicateDetectionResult,
    DuplicateQuestionPair,
)
from app.schemas.questions import QuestionIntelligenceResult


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def generate_embedding(text: str) -> list[float]:
    if not text.strip():
        raise ValueError("Text must not be empty")

    model = get_embedding_model()

    embedding = model.encode(
        text,
        normalize_embeddings=True,
    )

    return embedding.tolist()


def calculate_similarity(
    text_a: str,
    text_b: str,
) -> float:
    if not text_a.strip() or not text_b.strip():
        raise ValueError("Both texts must not be empty")

    model = get_embedding_model()

    embeddings = model.encode(
        [text_a, text_b],
        normalize_embeddings=True,
    )

    score = cosine_similarity(
        [embeddings[0]],
        [embeddings[1]],
    )[0][0]

    return round(float(score), 4)


def is_duplicate_question(
    text_a: str,
    text_b: str,
    threshold: float = 0.70,
) -> tuple[float, bool]:
    if not 0 <= threshold <= 1:
        raise ValueError(
            "Threshold must be between 0 and 1"
        )

    score = calculate_similarity(
        text_a,
        text_b,
    )

    return score, score >= threshold


def detect_duplicate_questions(
    questions: QuestionIntelligenceResult,
    threshold: float = 0.70,
) -> DuplicateDetectionResult:
    if not 0 <= threshold <= 1:
        raise ValueError(
            "Threshold must be between 0 and 1"
        )

    question_list = questions.questions

    if len(question_list) < 2:
        return DuplicateDetectionResult(
            threshold=threshold,
            total_questions=len(question_list),
            total_pairs_checked=0,
            total_duplicates=0,
            duplicates=[],
        )

    texts = [
        question.text
        for question in question_list
    ]

    model = get_embedding_model()

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
    )

    similarity_matrix = cosine_similarity(
        embeddings,
        embeddings,
    )

    duplicates: list[DuplicateQuestionPair] = []
    total_pairs_checked = 0

    for first_index in range(len(question_list)):
        for second_index in range(
            first_index + 1,
            len(question_list),
        ):
            total_pairs_checked += 1

            score = float(
                similarity_matrix[
                    first_index,
                    second_index,
                ]
            )

            if score < threshold:
                continue

            first_question = question_list[first_index]
            second_question = question_list[second_index]

            duplicates.append(
                DuplicateQuestionPair(
                    question_number_a=(
                        first_question.question_number
                    ),
                    question_a=first_question.text,
                    question_number_b=(
                        second_question.question_number
                    ),
                    question_b=second_question.text,
                    similarity_score=round(
                        score,
                        4,
                    ),
                    is_duplicate=True,
                )
            )

    return DuplicateDetectionResult(
        threshold=threshold,
        total_questions=len(question_list),
        total_pairs_checked=total_pairs_checked,
        total_duplicates=len(duplicates),
        duplicates=duplicates,
    )