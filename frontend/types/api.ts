export type FastApiHealthResponse = {
  status: string;
};

export type CleaningResult = {
  filename: string;
  file_type: string;
  total_segments: number;
  full_text: string;
  segments: Record<string, unknown>[];
};

export type ChunkingResult = {
  filename: string;
  file_type: string;
  total_chunks: number;
  chunk_size_words: number;
  overlap_words: number;
  chunks: Record<string, unknown>[];
};

export type QuestionBlockResult = {
  filename: string;
  file_type: string;
  total_blocks: number;
  blocks: Record<string, unknown>[];
};

export type DocumentProcessingResult = {
  cleaning: CleaningResult;
  chunking: ChunkingResult;
  question_blocks: QuestionBlockResult;
};

export type FastApiErrorResponse = {
  status?: string;
  message: string;
  detail?: string | null;
};

export type SourceReference = {
  reference_type: "line" | "page" | "paragraph" | "slide";
  reference_number: number;
};

export type StructuredQuestion = {
  question_number?: string | null;
  text: string;
  marks?: number | null;
  section?: string | null;
  command_verb?: string | null;
  question_type?:
    | "mcq"
    | "structured"
    | "essay"
    | "calculation"
    | "short_answer"
    | "unknown";
  difficulty?: "easy" | "medium" | "hard" | "unknown";
  source_reference: SourceReference;
};

export type QuestionIntelligenceResult = {
  filename: string;
  file_type: string;
  year?: number | null;
  total_questions: number;
  questions: StructuredQuestion[];
};

export type DiscoveredTopic = {
  topic_id: string;
  name: string;
  score: number;
  occurrence_count: number;
  parent_topic_id?: string | null;
  source_references: SourceReference[];
};

export type QuestionTopicMapping = {
  question_number?: string | null;
  question_text: string;
  topic_id: string;
  topic_name: string;
  relevance_score: number;
};

export type TopicDiscoveryResult = {
  filename: string;
  file_type: string;
  total_topics: number;
  topics: DiscoveredTopic[];
  question_mappings: QuestionTopicMapping[];
};

export type PredictionQuestionInput = {
  id: string;
  text: string;
  year?: number | null;
  question_type: string;
  marks?: number | null;
  topic_id?: string | null;
  topic_name?: string | null;
};

export type PredictionTopicInput = {
  id: string;
  name: string;
  question_count: number;
  document_count: number;
};

export type PredictionGenerateRequest = {
  questions: PredictionQuestionInput[];
  topics: PredictionTopicInput[];
  max_predictions: number;
};

export type PredictionResult = {
  title: string;
  explanation: string;

  score: number;
  rank: number;

  recurrence_score: number;
  similarity_score: number;
  recency_score: number;
  importance_score: number;

  topic_id?: string | null;
  topic_name?: string | null;
};

export type PredictionGenerateResult = {
  total_predictions: number;
  predictions: PredictionResult[];
};
