import re

from sklearn.feature_extraction.text import TfidfVectorizer

from app.schemas.processing import CleaningResult, SourceReference
from app.schemas.questions import QuestionIntelligenceResult
from app.schemas.topics import (
    DiscoveredTopic,
    QuestionTopicMapping,
    TopicDiscoveryResult,
)

GENERIC_WORDS = {
    "question",
    "questions",
    "answer",
    "answers",
    "marks",
    "mark",
    "section",
    "explain",
    "describe",
    "define",
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
    "remove",
    "removes",
    "require",
    "requires",
    "improve",
    "improves",
    "combine",
    "combines",
    "importance",
    "related",
    "rows",
    "purpose",
    "reports",
    "report",
    "used",
    "use",
}


def normalize_topic_name(topic: str) -> str:
    topic = topic.lower().strip()

    topic = re.sub(
        r"[^a-z0-9\s\-]",
        "",
        topic,
    )

    topic = re.sub(
        r"\s+",
        " ",
        topic,
    )

    return topic.strip()


def is_good_topic(topic: str) -> bool:
    words = topic.split()

    if not words:
        return False

    if any(word in GENERIC_WORDS for word in words):
        return False

    # Avoid tiny generic single words.
    if len(words) == 1 and len(words[0]) < 5:
        return False

    return True


def topic_adjusted_score(
    tfidf_score: float,
    topic_name: str,
) -> float:
    word_count = len(topic_name.split())

    # Stronger preference for meaningful phrases.
    if word_count == 2:
        multiplier = 1.8
    elif word_count >= 3:
        multiplier = 2.0
    else:
        multiplier = 0.8

    return tfidf_score * multiplier


def should_skip_redundant_topic(
    candidate: str,
    selected_names: list[str],
) -> bool:
    candidate_words = set(candidate.split())

    for selected in selected_names:
        selected_words = set(selected.split())

        # Exact duplicate.
        if candidate_words == selected_words:
            return True

        # Skip incomplete fragments when a more complete
        # phrase has already been selected.
        #
        # Example:
        # "second normal" is skipped when
        # "second normal form" already exists.
        if candidate_words < selected_words:
            return True

    return False


def assign_parent_topics(
    topics: list[DiscoveredTopic],
) -> list[DiscoveredTopic]:
    updated_topics: list[DiscoveredTopic] = []

    for topic in topics:
        topic_words = topic.name.split()

        best_parent: DiscoveredTopic | None = None

        for possible_parent in topics:
            if possible_parent.topic_id == topic.topic_id:
                continue

            parent_words = possible_parent.name.split()

            if len(parent_words) >= len(topic_words):
                continue

            parent_phrase = " ".join(parent_words)

            if parent_phrase in topic.name:
                if (
                    best_parent is None
                    or len(parent_words)
                    > len(best_parent.name.split())
                ):
                    best_parent = possible_parent

        updated_topics.append(
            topic.model_copy(
                update={
                    "parent_topic_id": (
                        best_parent.topic_id
                        if best_parent
                        else None
                    )
                }
            )
        )

    return updated_topics


def discover_topics(
    document: CleaningResult,
    questions: QuestionIntelligenceResult | None = None,
    max_topics: int = 10,
) -> TopicDiscoveryResult:
    if max_topics <= 0:
        raise ValueError("max_topics must be greater than 0")

    source_texts: list[str] = []
    source_references: list[SourceReference] = []

    for segment in document.segments:
        text = segment.text.strip()

        if not text:
            continue

        source_texts.append(text)

        source_references.append(
            SourceReference(
                reference_type=segment.reference_type,
                reference_number=segment.reference_number,
            )
        )

    if not source_texts:
        return TopicDiscoveryResult(
            filename=document.filename,
            file_type=document.file_type,
            total_topics=0,
            topics=[],
            question_mappings=[],
        )

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 3),
        lowercase=True,
        min_df=1,
    )

    matrix = vectorizer.fit_transform(source_texts)

    feature_names = vectorizer.get_feature_names_out()
    total_scores = matrix.sum(axis=0).A1

    candidates: list[
        tuple[int, str, float, float]
    ] = []

    for feature_index, raw_topic in enumerate(feature_names):
        topic_name = normalize_topic_name(raw_topic)

        if not is_good_topic(topic_name):
            continue

        raw_score = float(total_scores[feature_index])

        adjusted_score = topic_adjusted_score(
            raw_score,
            topic_name,
        )

        candidates.append(
            (
                feature_index,
                topic_name,
                raw_score,
                adjusted_score,
            )
        )

    candidates.sort(
        key=lambda item: (
            item[3],
            len(item[1].split()),
        ),
        reverse=True,
    )

    topics: list[DiscoveredTopic] = []
    selected_names: list[str] = []

    for (
        feature_index,
        topic_name,
        raw_score,
        _adjusted_score,
    ) in candidates:
        if should_skip_redundant_topic(
            topic_name,
            selected_names,
        ):
            continue

        feature_column = (
            matrix[:, feature_index]
            .toarray()
            .ravel()
        )

        occurrence_indices = [
            index
            for index, score in enumerate(feature_column)
            if score > 0
        ]

        references: list[SourceReference] = []

        seen_refs: set[tuple[str, int]] = set()

        for index in occurrence_indices:
            reference = source_references[index]

            key = (
                reference.reference_type,
                reference.reference_number,
            )

            if key not in seen_refs:
                seen_refs.add(key)
                references.append(reference)

        topics.append(
            DiscoveredTopic(
                topic_id=f"topic-{len(topics) + 1}",
                name=topic_name,
                score=round(raw_score, 4),
                occurrence_count=len(references),
                parent_topic_id=None,
                source_references=references,
            )
        )

        selected_names.append(topic_name)

        if len(topics) >= max_topics:
            break

    topics = assign_parent_topics(topics)

    question_mappings = map_questions_to_topics(
        questions,
        topics,
    )

    return TopicDiscoveryResult(
        filename=document.filename,
        file_type=document.file_type,
        total_topics=len(topics),
        topics=topics,
        question_mappings=question_mappings,
    )


def map_questions_to_topics(
    questions: QuestionIntelligenceResult | None,
    topics: list[DiscoveredTopic],
) -> list[QuestionTopicMapping]:
    if (
        questions is None
        or not questions.questions
        or not topics
    ):
        return []

    topic_names = [
        topic.name
        for topic in topics
    ]

    question_texts = [
        question.text
        for question in questions.questions
    ]

    corpus = topic_names + question_texts

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 3),
    )

    matrix = vectorizer.fit_transform(corpus)

    topic_matrix = matrix[: len(topic_names)]
    question_matrix = matrix[len(topic_names):]

    similarity_matrix = (
        question_matrix @ topic_matrix.T
    ).toarray()

    mappings: list[QuestionTopicMapping] = []

    for question_index, question in enumerate(
        questions.questions
    ):
        scores = similarity_matrix[question_index]

        if not scores.any():
            continue

        best_topic_index = int(scores.argmax())
        best_score = float(scores[best_topic_index])

        if best_score <= 0:
            continue

        best_topic = topics[best_topic_index]

        mappings.append(
            QuestionTopicMapping(
                question_number=question.question_number,
                question_text=question.text,
                topic_id=best_topic.topic_id,
                topic_name=best_topic.name,
                relevance_score=round(
                    best_score,
                    4,
                ),
            )
        )

    return mappings
