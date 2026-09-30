from app.schemas.analytics import HistoricalAnalyticsResult
from app.schemas.predictions import (
    BacktestMatch,
    PredictionBacktestResult,
    PredictionFactors,
    PredictionResult,
    PredictionWeights,
    TopicPrediction,
)


def _normalize(
    value: float,
    maximum: float,
) -> float:
    if maximum <= 0:
        return 0.0

    return value / maximum


def _normalize_weights(
    weights: PredictionWeights,
) -> PredictionWeights:
    total = (
        weights.frequency
        + weights.recency
        + weights.recurrence
        + weights.marks_importance
    )

    if total <= 0:
        raise ValueError(
            "At least one prediction weight must be greater than 0"
        )

    return PredictionWeights(
        frequency=weights.frequency / total,
        recency=weights.recency / total,
        recurrence=weights.recurrence / total,
        marks_importance=(
            weights.marks_importance / total
        ),
    )


def generate_predictions(
    analytics: HistoricalAnalyticsResult,
    weights: PredictionWeights | None = None,
    limit: int = 5,
) -> PredictionResult:
    if limit <= 0:
        raise ValueError(
            "Prediction limit must be greater than 0"
        )

    normalized_weights = _normalize_weights(
        weights or PredictionWeights()
    )

    if not analytics.topic_analytics:
        return PredictionResult(
            weights=normalized_weights,
            total_topics=0,
            recommendations=[],
        )

    topics = analytics.topic_analytics

    maximum_frequency = max(
        topic.total_questions
        for topic in topics
    )

    maximum_average_marks = max(
        topic.average_marks
        for topic in topics
    )

    all_years = [
        yearly.year
        for topic in topics
        for yearly in topic.yearly_frequency
    ]

    latest_year = max(all_years)
    earliest_year = min(all_years)

    year_span = max(
        latest_year - earliest_year,
        1,
    )

    maximum_recurrence = max(
        len(topic.yearly_frequency)
        for topic in topics
    )

    predictions: list[TopicPrediction] = []

    for topic in topics:
        frequency_score = _normalize(
            topic.total_questions,
            maximum_frequency,
        )

        topic_latest_year = max(
            yearly.year
            for yearly in topic.yearly_frequency
        )

        recency_score = 1 - (
            (latest_year - topic_latest_year)
            / year_span
        )

        recurrence_score = _normalize(
            len(topic.yearly_frequency),
            maximum_recurrence,
        )

        marks_importance_score = _normalize(
            topic.average_marks,
            maximum_average_marks,
        )

        frequency_contribution = (
            frequency_score
            * normalized_weights.frequency
        )

        recency_contribution = (
            recency_score
            * normalized_weights.recency
        )

        recurrence_contribution = (
            recurrence_score
            * normalized_weights.recurrence
        )

        marks_importance_contribution = (
            marks_importance_score
            * normalized_weights.marks_importance
        )

        final_score = (
            frequency_contribution
            + recency_contribution
            + recurrence_contribution
            + marks_importance_contribution
        )

        explanation = [
            (
                f"Appeared {topic.total_questions} "
                f"time(s) in historical papers."
            ),
            (
                f"Most recent appearance was "
                f"{topic_latest_year}."
            ),
            (
                f"Appeared across "
                f"{len(topic.yearly_frequency)} "
                f"different year(s)."
            ),
            (
                f"Average mark value is "
                f"{topic.average_marks:.2f}."
            ),
        ]

        predictions.append(
            TopicPrediction(
                rank=0,
                topic_name=topic.topic_name,
                prediction_score=round(
                    final_score,
                    4,
                ),
                factors=PredictionFactors(
                    frequency_score=round(
                        frequency_score,
                        4,
                    ),
                    recency_score=round(
                        recency_score,
                        4,
                    ),
                    recurrence_score=round(
                        recurrence_score,
                        4,
                    ),
                    marks_importance_score=round(
                        marks_importance_score,
                        4,
                    ),
                    frequency_contribution=round(
                        frequency_contribution,
                        4,
                    ),
                    recency_contribution=round(
                        recency_contribution,
                        4,
                    ),
                    recurrence_contribution=round(
                        recurrence_contribution,
                        4,
                    ),
                    marks_importance_contribution=round(
                        marks_importance_contribution,
                        4,
                    ),
                ),
                explanation=explanation,
            )
        )

    predictions.sort(
        key=lambda prediction: (
            -prediction.prediction_score,
            prediction.topic_name,
        )
    )

    ranked_predictions: list[TopicPrediction] = []

    for rank, prediction in enumerate(
        predictions[:limit],
        start=1,
    ):
        ranked_predictions.append(
            prediction.model_copy(
                update={
                    "rank": rank,
                }
            )
        )

    return PredictionResult(
        weights=normalized_weights,
        total_topics=len(topics),
        recommendations=ranked_predictions,
    )


def _normalize_topic_name(
    topic_name: str,
) -> str:
    return " ".join(
        topic_name.lower().strip().split()
    )


def backtest_predictions(
    analytics: HistoricalAnalyticsResult,
    actual_topics: list[str],
    weights: PredictionWeights | None = None,
    top_k: int = 5,
) -> PredictionBacktestResult:
    if top_k <= 0:
        raise ValueError(
            "top_k must be greater than 0"
        )

    if not actual_topics:
        raise ValueError(
            "At least one actual topic is required"
        )

    prediction_result = generate_predictions(
        analytics,
        weights=weights,
        limit=top_k,
    )

    normalized_actual_lookup = {
        _normalize_topic_name(topic): topic
        for topic in actual_topics
    }

    matched_actual_names: set[str] = set()
    matches: list[BacktestMatch] = []

    for prediction in prediction_result.recommendations:
        normalized_prediction = _normalize_topic_name(
            prediction.topic_name
        )

        actual_topic = normalized_actual_lookup.get(
            normalized_prediction
        )

        if actual_topic is None:
            continue

        if normalized_prediction in matched_actual_names:
            continue

        matched_actual_names.add(
            normalized_prediction
        )

        matches.append(
            BacktestMatch(
                predicted_rank=prediction.rank,
                predicted_topic=prediction.topic_name,
                prediction_score=(
                    prediction.prediction_score
                ),
                actual_topic=actual_topic,
            )
        )

    unique_actual_topics = {
        _normalize_topic_name(topic): topic
        for topic in actual_topics
    }

    hit_count = len(matches)

    hit_rate = (
        hit_count / len(unique_actual_topics)
    )

    prediction_count = len(
        prediction_result.recommendations
    )

    precision_at_k = (
        hit_count / prediction_count
        if prediction_count > 0
        else 0.0
    )

    missed_actual_topics = [
        original_name
        for normalized_name, original_name
        in unique_actual_topics.items()
        if normalized_name
        not in matched_actual_names
    ]

    return PredictionBacktestResult(
        top_k=top_k,
        predicted_topics=[
            prediction.topic_name
            for prediction
            in prediction_result.recommendations
        ],
        actual_topics=list(
            unique_actual_topics.values()
        ),
        hit_count=hit_count,
        hit_rate=round(
            hit_rate,
            4,
        ),
        precision_at_k=round(
            precision_at_k,
            4,
        ),
        matches=matches,
        missed_actual_topics=(
            missed_actual_topics
        ),
    )
