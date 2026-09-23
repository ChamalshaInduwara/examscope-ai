from pydantic import BaseModel

from app.schemas.processing import SourceReference


class DiscoveredTopic(BaseModel):
    topic_id: str
    name: str
    score: float
    occurrence_count: int
    parent_topic_id: str | None = None
    source_references: list[SourceReference]


class QuestionTopicMapping(BaseModel):
    question_number: str | None = None
    question_text: str
    topic_id: str
    topic_name: str
    relevance_score: float


class TopicDiscoveryResult(BaseModel):
    filename: str
    file_type: str
    total_topics: int
    topics: list[DiscoveredTopic]
    question_mappings: list[QuestionTopicMapping]