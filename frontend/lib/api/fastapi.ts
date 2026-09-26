import type {
  DocumentProcessingResult,
  FastApiErrorResponse,
  FastApiHealthResponse,
  QuestionIntelligenceResult,
  TopicDiscoveryResult,
} from "@/types/api";

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
