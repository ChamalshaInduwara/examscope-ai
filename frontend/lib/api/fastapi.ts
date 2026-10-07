import "server-only";

import type {
  DocumentProcessingResult,
  FastApiErrorResponse,
  FastApiHealthResponse,
  PredictionGenerateRequest,
  PredictionGenerateResult,
  QuestionIntelligenceResult,
  TopicDiscoveryResult,
} from "@/types/api";

export type YearlyFrequency = {
  year: number;
  question_count: number;
  total_marks: number;
};

export type TopicAnalytics = {
  topic_name: string;
  total_questions: number;
  total_marks: number;
  average_marks: number;
  yearly_frequency: YearlyFrequency[];
};

export type DistributionItem = {
  name: string;
  count: number;
  percentage: number;
};

export type HistoricalAnalyticsResult = {
  total_papers: number;
  total_questions: number;
  total_marks: number;
  topic_analytics: TopicAnalytics[];
  question_type_distribution: DistributionItem[];
  difficulty_distribution: DistributionItem[];
  command_verb_distribution: DistributionItem[];
};

export type PredictionBacktestRequest = {
  analytics: HistoricalAnalyticsResult;
  actual_topics: string[];

  weights?: {
    frequency: number;
    recency: number;
    recurrence: number;
    marks_importance: number;
  };

  top_k?: number;
};

export type PredictionBacktestResult = {
  top_k: number;
  predicted_topics: string[];
  actual_topics: string[];
  hit_count: number;
  hit_rate: number;
  precision_at_k: number;

  matches: Array<{
    predicted_rank: number;
    predicted_topic: string;
    prediction_score: number;
    actual_topic: string;
  }>;

  missed_actual_topics: string[];
};

export type RagMode = "mcq" | "structured" | "essay";

export type RagDifficulty = "easy" | "medium" | "hard";

export type RagChunk = {
  chunk_index: number;
  text: string;
  word_count: number;
  source_references: Array<{
    reference_type: string;
    reference_number: number;
  }>;
};

export type RagChunkingResult = {
  filename: string;
  file_type: string;
  total_chunks: number;
  chunk_size_words: number;
  overlap_words: number;
  chunks: RagChunk[];
};

export type RagSourceReference = {
  reference_type?: string;
  reference_value?: string | number;
  [key: string]: unknown;
};

export type RagRetrievedEvidence = {
  evidence_id: string;
  filename: string;
  chunk_index: number;
  text: string;
  relevance_score: number;
  source_references: RagSourceReference[];
};

export type RagMCQOption = {
  label: "A" | "B" | "C" | "D";
  text: string;
};

export type RagMCQQuestion = {
  generatedQuestionId?: string;
  question_text: string;
  difficulty: RagDifficulty;
  explanation: string;
  key_points: string[];
  source_evidence_ids: string[];
  marks: number;
  options: RagMCQOption[];
  correct_option: "A" | "B" | "C" | "D";
  answer_text: string;
};

export type RagStructuredPart = {
  label: string;
  question_text: string;
  marks: number;
  answer: string;
};

export type RagStructuredQuestion = {
  generatedQuestionId?: string;
  question_text: string;
  difficulty: RagDifficulty;
  explanation: string;
  key_points: string[];
  source_evidence_ids: string[];
  total_marks: number;
  parts: RagStructuredPart[];
  answer_text: string;
  marks_guidance: string;
};

export type RagEssayQuestion = {
  generatedQuestionId?: string;
  question_text: string;
  difficulty: RagDifficulty;
  explanation: string;
  key_points: string[];
  source_evidence_ids: string[];
  marks: number;
  outline: string[];
  model_answer: string;
  marks_guidance: string;
};

export type RagGeneratedQuestion =
  | RagMCQQuestion
  | RagStructuredQuestion
  | RagEssayQuestion;

export type RagGenerationResult = {
  status: "success" | "partial" | "insufficient_evidence";
  mode: RagMode;
  requested_count: number;
  generated_count: number;
  topic: string;
  difficulty: RagDifficulty;
  questions: RagGeneratedQuestion[];
  retrieved_evidence: RagRetrievedEvidence[];
  reason: string | null;
};

const FASTAPI_BASE_URL =
  process.env.FASTAPI_BASE_URL;

const internalApiKey =
  process.env.INTERNAL_API_KEY;

if (!FASTAPI_BASE_URL) {
  throw new Error(
    "FASTAPI_BASE_URL is not configured.",
  );
}

if (!internalApiKey) {
  throw new Error(
    "INTERNAL_API_KEY is not configured.",
  );
}

const INTERNAL_API_KEY: string =
  internalApiKey;

export class FastApiError extends Error {
  status: number;
  detail?: string | null;

  constructor(message: string, status: number, detail?: string | null) {
    super(message);

    this.name = "FastApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function fastApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set(
    "X-Internal-API-Key",
    INTERNAL_API_KEY,
  );

  if (
    init?.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${FASTAPI_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorMessage = `FastAPI request failed with status ${response.status}.`;

    let detail: string | null = null;

    try {
      const error = (await response.json()) as FastApiErrorResponse;

      if (error.message) {
        errorMessage = error.message;
      }

      detail = error.detail ?? null;
    } catch {
      // Keep the fallback error message.
    }

    throw new FastApiError(errorMessage, response.status, detail);
  }

  return response.json() as Promise<T>;
}

export function getFastApiHealth() {
  return fastApiRequest<FastApiHealthResponse>("/health");
}

type ProcessDocumentInput = {
  file: Blob;
  fileName: string;
};

export function processDocumentWithFastApi({
  file,
  fileName,
}: ProcessDocumentInput) {
  const formData = new FormData();

  formData.append("file", file, fileName);

  return fastApiRequest<DocumentProcessingResult>("/api/v1/documents/process", {
    method: "POST",
    body: formData,
  });
}

type AnalyzeQuestionsInput = {
  file: Blob;
  fileName: string;
  year?: number | null;
};

export function analyzeQuestionsWithFastApi({
  file,
  fileName,
  year,
}: AnalyzeQuestionsInput) {
  const formData = new FormData();

  formData.append("file", file, fileName);

  const searchParams = new URLSearchParams();

  if (year != null) {
    searchParams.set("year", year.toString());
  }

  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";

  return fastApiRequest<QuestionIntelligenceResult>(
    `/api/v1/documents/questions/analyze${query}`,
    {
      method: "POST",
      body: formData,
    },
  );
}

type DiscoverTopicsInput = {
  file: Blob;
  fileName: string;
  maxTopics?: number;
};

export function discoverTopicsWithFastApi({
  file,
  fileName,
  maxTopics = 10,
}: DiscoverTopicsInput) {
  const formData = new FormData();

  formData.append("file", file, fileName);

  const searchParams = new URLSearchParams();

  searchParams.set("max_topics", maxTopics.toString());

  return fastApiRequest<TopicDiscoveryResult>(
    `/api/v1/topics/discover?${searchParams.toString()}`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export function generatePredictionsWithFastApi(
  input: PredictionGenerateRequest,
) {
  return fastApiRequest<PredictionGenerateResult>(
    "/api/v1/predictions/generate",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function backtestPredictionsWithFastApi(
  input: PredictionBacktestRequest,
) {
  return fastApiRequest<PredictionBacktestResult>(
    "/api/v1/predictions/backtest",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function generateQuestionsWithFastApi(input: {
  files: Array<{
    file: Blob;
    fileName: string;
  }>;
  topic: string;
  mode: RagMode;
  difficulty: RagDifficulty;
  subjectName?: string;
  count?: number;
  topK?: number;
  minimumRelevance?: number;
}) {
  if (input.files.length === 0) {
    throw new Error("At least one source document is required.");
  }

  if (input.files.length > 3) {
    throw new Error("A maximum of three source documents can be used.");
  }

  const formData = new FormData();

  input.files.forEach((item, index) => {
    formData.append(`file_${index + 1}`, item.file, item.fileName);
  });

  formData.append("topic", input.topic);
  formData.append("mode", input.mode);
  formData.append("difficulty", input.difficulty);

  if (input.subjectName) {
    formData.append("subject_name", input.subjectName);
  }

  const params = new URLSearchParams({
    count: String(input.count ?? 5),
    top_k: String(input.topK ?? 5),
    minimum_relevance: String(input.minimumRelevance ?? 0.25),
  });

  return fastApiRequest<RagGenerationResult>(
    `/api/v1/rag/generate?${params.toString()}`,
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function generateQuestionsFromChunksWithFastApi(input: {
  documents: RagChunkingResult[];
  topic: string;
  mode: RagMode;
  difficulty: RagDifficulty;
  subjectName?: string;
  count?: number;
  topK?: number;
  minimumRelevance?: number;
}) {
  if (input.documents.length === 0 || input.documents.length > 3) {
    throw new Error("Select between one and three processed documents.");
  }

  return fastApiRequest<RagGenerationResult>(
    "/api/v1/rag/generate-from-chunks",
    {
      method: "POST",
      body: JSON.stringify({
        documents: input.documents,
        topic: input.topic,
        mode: input.mode,
        difficulty: input.difficulty,
        subject_name: input.subjectName ?? null,
        count: input.count ?? 5,
        top_k: input.topK ?? 5,
        minimum_relevance: input.minimumRelevance ?? 0.25,
      }),
    },
  );
}
