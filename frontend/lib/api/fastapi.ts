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

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL;

if (!FASTAPI_BASE_URL) {
  throw new Error("FASTAPI_BASE_URL is not configured.");
}

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
