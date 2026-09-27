from itertools import combinations

from app.schemas.predictions import (
    PredictionGenerateRequest,
    PredictionGenerateResult,
    PredictionResult,
    PredictionQuestionInput,
    PredictionTopicInput,
)
from app.services.embedding_service import calculate_similarity


RECURRENCE_WEIGHT = 0.30
SIMILARITY_WEIGHT = 0.30
RECENCY_WEIGHT = 0.20
IMPORTANCE_WEIGHT = 0.20

MAX_SIMILARITY_QUESTIONS = 10


def _clamp_score(value: float) -> float:
    return round(
        max(0.0, min(1.0, value)),
        4,
    )


def _questions_for_topic(
    questions: list[PredictionQuestionInput],
    topic_id: str,
) -> list[PredictionQuestionInput]:
    return [
        question
        for question in questions
        if question.topic_id == topic_id
    ]


def _calculate_recurrence_score(
    topic_questions: list[PredictionQuestionInput],
    all_years: set[int],
) -> float:
    topic_years = {
        question.year
        for question in topic_questions
        if question.year is not None
    }

    if not all_years:
        return 0.0

    if not topic_years:
        return 0.0

    return _clamp_score(
        len(topic_years) / len(all_years)
    )


def _calculate_similarity_score(
    topic_questions: list[PredictionQuestionInput],
) -> float:
    usable_questions = [
        question
        for question in topic_questions
        if question.text.strip()
    ][:MAX_SIMILARITY_QUESTIONS]

    if len(usable_questions) < 2:
        return 0.0

    scores: list[float] = []

    for first, second in combinations(
        usable_questions,
        2,
    ):
        score = calculate_similarity(
            first.text,
            second.text,
        )

        scores.append(score)

    if not scores:
        return 0.0

    return _clamp_score(
        sum(scores) / len(scores)
    )


def _calculate_recency_score(
    topic_questions: list[PredictionQuestionInput],
    all_years: list[int],
) -> float:
    if not all_years:
        return 0.0

    topic_years = [
        question.year
        for question in topic_questions
        if question.year is not None
    ]

    if not topic_years:
        return 0.0

    newest_topic_year = max(topic_years)

    oldest_year = min(all_years)
    newest_year = max(all_years)

    if oldest_year == newest_year:
        return 1.0

    return _clamp_score(
        (
            newest_topic_year
            - oldest_year
        )
        /
        (
            newest_year
            - oldest_year
        )
    )


def _calculate_importance_score(
    topic: PredictionTopicInput,
    max_question_count: int,
    max_document_count: int,
) -> float:
    question_component = (
        topic.question_count
        / max_question_count
        if max_question_count > 0
        else 0.0
    )

    document_component = (
        topic.document_count
        / max_document_count
        if max_document_count > 0
        else 0.0
    )

    return _clamp_score(
        (question_component * 0.6)
        + (document_component * 0.4)
    )


def _calculate_overall_score(
    recurrence_score: float,
    similarity_score: float,
    recency_score: float,
    importance_score: float,
) -> float:
    return _clamp_score(
        (
            recurrence_score
            * RECURRENCE_WEIGHT
        )
        +
        (
            similarity_score
            * SIMILARITY_WEIGHT
        )
        +
        (
            recency_score
            * RECENCY_WEIGHT
        )
        +
        (
            importance_score
            * IMPORTANCE_WEIGHT
        )
    )


def generate_predictions(
    request: PredictionGenerateRequest,
) -> PredictionGenerateResult:
    if not request.topics:
        return PredictionGenerateResult(
            total_predictions=0,
            predictions=[],
        )

    all_years = [
        question.year
        for question in request.questions
        if question.year is not None
    ]

    unique_years = set(all_years)

    max_question_count = max(
        (
            topic.question_count
            for topic in request.topics
        ),
        default=0,
    )

    max_document_count = max(
        (
            topic.document_count
            for topic in request.topics
        ),
        default=0,
    )

    prediction_rows: list[PredictionResult] = []

    for topic in request.topics:
        topic_questions = _questions_for_topic(
            request.questions,
            topic.id,
        )

        recurrence_score = (
            _calculate_recurrence_score(
                topic_questions,
                unique_years,
            )
        )

        similarity_score = (
            _calculate_similarity_score(
                topic_questions
            )
        )

        recency_score = (
            _calculate_recency_score(
                topic_questions,
                all_years,
            )
        )

        importance_score = (
            _calculate_importance_score(
                topic,
                max_question_count,
                max_document_count,
            )
        )

        overall_score = (
            _calculate_overall_score(
                recurrence_score,
                similarity_score,
                recency_score,
                importance_score,
            )
        )

        explanation = (
            f"{topic.name} appeared in "
            f"{topic.question_count} analyzed questions "
            f"across {topic.document_count} documents. "
            f"The prediction score combines historical "
            f"recurrence, semantic similarity, recency, "
            f"and topic importance."
        )

        prediction_rows.append(
            PredictionResult(
                title=topic.name,
                explanation=explanation,
                score=overall_score,
                rank=0,
                recurrence_score=recurrence_score,
                similarity_score=similarity_score,
                recency_score=recency_score,
                importance_score=importance_score,
                topic_id=topic.id,
                topic_name=topic.name,
            )
        )

    prediction_rows.sort(
        key=lambda prediction: prediction.score,
        reverse=True,
    )

    prediction_rows = prediction_rows[
        : request.max_predictions
    ]

    ranked_predictions: list[
        PredictionResult
    ] = []

    for index, prediction in enumerate(
        prediction_rows,
        start=1,
    ):
        ranked_predictions.append(
            prediction.model_copy(
                update={
                    "rank": index,
                }
            )
        )

    return PredictionGenerateResult(
        total_predictions=len(
            ranked_predictions
        ),
        predictions=ranked_predictions,
    )