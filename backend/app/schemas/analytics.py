from pydantic import BaseModel


class YearlyFrequency(BaseModel):
    year: int
    question_count: int
    total_marks: int


class TopicAnalytics(BaseModel):
    topic_name: str
    total_questions: int
    total_marks: int
    average_marks: float
    yearly_frequency: list[YearlyFrequency]


class DistributionItem(BaseModel):
    name: str
    count: int
    percentage: float


class HistoricalAnalyticsResult(BaseModel):
    total_papers: int
    total_questions: int
    total_marks: int
    topic_analytics: list[TopicAnalytics]
    question_type_distribution: list[DistributionItem]
    difficulty_distribution: list[DistributionItem]
    command_verb_distribution: list[DistributionItem]