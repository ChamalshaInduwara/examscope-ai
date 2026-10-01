"""External JSON generation; no document or retrieval logic belongs here."""
import json
import re
from typing import Protocol

import httpx

from app.core.config import settings


class GenerationProviderError(Exception):
    """Safe public error message; never include provider bodies or credentials."""

    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


class GenerationProvider(Protocol):
    def generate_json(self, system_prompt: str, user_prompt: str) -> dict: ...


class GeminiGenerationProvider:
    def __init__(self, api_key: str, model: str, timeout_seconds: float = 30.0):
        model = model.removeprefix("models/")
        if not re.fullmatch(r"[A-Za-z0-9._-]+", model):
            raise GenerationProviderError("Invalid RAG provider model configuration", 503)
        self._api_key = api_key
        self._model = model
        self._timeout = timeout_seconds

    def generate_json(self, system_prompt: str, user_prompt: str) -> dict:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self._model}:generateContent"
        )
        try:
            with httpx.Client(timeout=self._timeout) as client:
                response = client.post(
                    url,
                    headers={"x-goog-api-key": self._api_key},
                    json={
                        "systemInstruction": {"parts": [{"text": system_prompt}]},
                        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
                        "generationConfig": {
                            "responseMimeType": "application/json",
                            "maxOutputTokens": 8192,
                        },
                    },
                )
        except httpx.TimeoutException:
            raise GenerationProviderError("RAG generation provider timed out", 504) from None
        except httpx.RequestError:
            raise GenerationProviderError("RAG generation provider could not be reached") from None

        if not response.is_success:
            raise GenerationProviderError(
                f"RAG generation provider returned HTTP {response.status_code}"
            )
        try:
            payload = response.json()
            candidate = payload["candidates"][0]
            if candidate.get("finishReason") != "STOP":
                raise GenerationProviderError("RAG provider did not finish a usable response")
            parts = candidate["content"]["parts"]
            output = "".join(part["text"] for part in parts if not part.get("thought", False))
            result = json.loads(output)
            if not isinstance(result, dict):
                raise ValueError("Expected an object")
            return result
        except (ValueError, KeyError, IndexError, TypeError, AttributeError):
            raise GenerationProviderError("RAG generation provider returned malformed JSON") from None


def get_generation_provider() -> GenerationProvider:
    key = (settings.gemini_api_key or "").strip()
    model = (settings.gemini_model or "").strip()
    if not key or not model:
        raise GenerationProviderError("RAG generation provider is not configured", 503)
    return GeminiGenerationProvider(key, model, settings.generation_timeout_seconds)
