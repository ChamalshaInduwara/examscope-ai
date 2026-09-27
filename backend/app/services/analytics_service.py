from collections import Counter, defaultdict

from app.schemas.analytics import (
    DistributionItem,
    HistoricalAnalyticsResult,
    TopicAnalytics,
    YearlyFrequency,
)
from app.schemas.questions import QuestionIntelligenceResult
from app.schemas.topics import TopicDiscoveryResult


def _build_distribution(
    counter: Counter[str],
    total: int,
) -> list[DistributionItem]:
    items: list[DistributionItem] = []

    for name, count in counter.most_common():
        percentage = (
            round((count / total) * 100, 2)
            if total > 0
            else 0.0
        )

        items.append(
            DistributionItem(
                name=name,
                count=count,
                percentage=percentage,
            )
        )

    return items


def analyze_historical_patterns(
    papers: list[QuestionIntelligenceResult],
    topic_results: list[TopicDiscoveryResult],
) -> HistoricalAnalyticsResult:
    if len(papers) != len(topic_results):
        raise ValueError(
            "Each paper must have a matching topic result"
        )

    total_questions = 0
    total_marks = 0

    question_type_counts: Counter[str] = Counter()
    difficulty_counts: Counter[str] = Counter()
    command_verb_counts: Counter[str] = Counter()

    topic_data = defaultdict(
        lambda: {
            "total_questions": 0,
            "total_marks": 0,
            "marked_questions": 0,
            "years": defaultdict(
                lambda: {
                    "question_count": 0,
                    "total_marks": 0,
                }
            ),
        }
    )

    for paper, topic_result in zip(
        papers,
        topic_results,
        strict=True,
    ):
        if paper.filename != topic_result.filename:
            raise ValueError(
                "Paper and topic result filenames do not match"
            )

        if paper.year is None:
            raise ValueError(
                f"Year is missing for {paper.filename}"
            )

        mapping_lookup = {
            (
                mapping.question_number,
                mapping.question_text,
            ): mapping.topic_name
            for mapping in topic_result.question_mappings
        }

        for question in paper.questions:
            total_questions += 1

            question_type_counts[
                question.question_type
            ] += 1

            difficulty_counts[
                question.difficulty
            ] += 1

            command_verb_counts[
                question.command_verb or "unknown"
            ] += 1

            if question.marks is not None:
                total_marks += question.marks

            topic_name = mapping_lookup.get(
                (
                    question.question_number,
                    question.text,
                )
            )

            if topic_name is None:
                continue

            topic = topic_data[topic_name]

            topic["total_questions"] += 1

            topic["years"][paper.year][
                "question_count"
            ] += 1

            if question.marks is not None:
                topic["total_marks"] += question.marks
                topic["marked_questions"] += 1

                topic["years"][paper.year][
                    "total_marks"
                ] += question.marks

    topic_analytics: list[TopicAnalytics] = []

    for topic_name, data in topic_data.items():
        yearly_frequency = [
            YearlyFrequency(
                year=year,
                question_count=year_data[
                    "question_count"
                ],
                total_marks=year_data[
                    "total_marks"
                ],
            )
            for year, year_data in sorted(
                data["years"].items()
            )
        ]

        marked_questions = data["marked_questions"]

        average_marks = (
            round(
                data["total_marks"]
                / marked_questions,
                2,
            )
            if marked_questions > 0
            else 0.0
        )

        topic_analytics.append(
            TopicAnalytics(
                topic_name=topic_name,
                total_questions=data[
                    "total_questions"
                ],
                total_marks=data[
                    "total_marks"
                ],
                average_marks=average_marks,
                yearly_frequency=yearly_frequency,
            )
        )

    topic_analytics.sort(
        key=lambda topic: (
            -topic.total_questions,
            -topic.total_marks,
            topic.topic_name,
        )
    )

    return HistoricalAnalyticsResult(
        total_papers=len(papers),
        total_questions=total_questions,
        total_marks=total_marks,
        topic_analytics=topic_analytics,
        question_type_distribution=(
            _build_distribution(
                question_type_counts,
                total_questions,
            )
        ),
        difficulty_distribution=(
            _build_distribution(
                difficulty_counts,
                total_questions,
            )
        ),
        command_verb_distribution=(
            _build_distribution(
                command_verb_counts,
                total_questions,
            )
        ),
    )