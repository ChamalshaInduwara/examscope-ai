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
    def __init__(
        self,
        api_key: str,
        model: str,
        timeout_seconds: float = 30.0,
    ):
        model = model.removeprefix("models/")

        if not re.fullmatch(r"[A-Za-z0-9._-]+", model):
            raise GenerationProviderError(
                "Invalid RAG provider model configuration",
                503,
            )

        self._api_key = api_key
        self._model = model
        self._timeout = timeout_seconds

    def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> dict:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self._model}:generateContent"
        )

        try:
            with httpx.Client(timeout=self._timeout) as client:
                response = client.post(
                    url,
                    headers={
                        "x-goog-api-key": self._api_key,
                    },
                    json={
                        "systemInstruction": {
                            "parts": [
                                {
                                    "text": system_prompt,
                                }
                            ]
                        },
                        "contents": [
                            {
                                "role": "user",
                                "parts": [
                                    {
                                        "text": user_prompt,
                                    }
                                ],
                            }
                        ],
                        "generationConfig": {
                            "responseMimeType": "application/json",
                            "maxOutputTokens": 8192,
                        },
                    },
                )

        except httpx.TimeoutException:
            raise GenerationProviderError(
                "RAG generation provider timed out",
                504,
            ) from None

        except httpx.RequestError:
            raise GenerationProviderError(
                "RAG generation provider could not be reached"
            ) from None

        if not response.is_success:
            raise GenerationProviderError(
                f"RAG generation provider returned HTTP {response.status_code}"
            )

        try:
            payload = response.json()

            candidate = payload["candidates"][0]

            if candidate.get("finishReason") != "STOP":
                raise GenerationProviderError(
                    "RAG provider did not finish a usable response"
                )

            parts = candidate["content"]["parts"]

            output = "".join(
                part["text"]
                for part in parts
                if not part.get("thought", False)
            )

            result = json.loads(output)

            if not isinstance(result, dict):
                raise ValueError("Expected an object")

            return result

        except (
            ValueError,
            KeyError,
            IndexError,
            TypeError,
            AttributeError,
        ):
            raise GenerationProviderError(
                "RAG generation provider returned malformed JSON"
            ) from None


class OpenRouterGenerationProvider:
    def __init__(
        self,
        api_key: str,
        model: str,
        timeout_seconds: float = 30.0,
    ):
        if not api_key.strip():
            raise GenerationProviderError(
                "OpenRouter API key is not configured",
                503,
            )

        if not model.strip():
            raise GenerationProviderError(
                "OpenRouter model is not configured",
                503,
            )

        self._api_key = api_key.strip()
        self._model = model.strip()
        self._timeout = timeout_seconds

    @staticmethod
    def _extract_json(output: str) -> dict:
        text = output.strip()

        if text.startswith("```"):
            text = re.sub(
                r"^```(?:json)?\s*",
                "",
                text,
                flags=re.IGNORECASE,
            )

            text = re.sub(
                r"\s*```$",
                "",
                text,
            )

            text = text.strip()

        try:
            result = json.loads(text)

            if isinstance(result, dict):
                return result

        except json.JSONDecodeError:
            pass

        start = text.find("{")
        end = text.rfind("}")

        if start != -1 and end > start:
            candidate = text[start : end + 1]

            try:
                result = json.loads(candidate)

                if isinstance(result, dict):
                    return result

            except json.JSONDecodeError:
                pass

        raise GenerationProviderError(
            "RAG generation provider did not return valid JSON"
        )

    def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> dict:
        url = "https://openrouter.ai/api/v1/chat/completions"

        strict_user_prompt = (
            f"{user_prompt}\n\n"
            "IMPORTANT OUTPUT REQUIREMENT:\n"
            "Return exactly one valid JSON object.\n"
            "Do not include Markdown code fences.\n"
            "Do not include commentary before or after the JSON."
        )

        try:
            with httpx.Client(
                timeout=self._timeout,
            ) as client:
                response = client.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {self._api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self._model,
                        "messages": [
                            {
                                "role": "system",
                                "content": system_prompt,
                            },
                            {
                                "role": "user",
                                "content": strict_user_prompt,
                            },
                        ],
                        "max_tokens": 8192,
                        "temperature": 0.2,
                    },
                )

        except httpx.TimeoutException:
            raise GenerationProviderError(
                "RAG generation provider timed out",
                504,
            ) from None

        except httpx.RequestError:
            raise GenerationProviderError(
                "RAG generation provider could not be reached"
            ) from None

        if not response.is_success:
            if response.status_code == 429:
                raise GenerationProviderError(
                    "OpenRouter free models are currently rate limited. "
                    "Please try again shortly.",
                    429,
                )

            if response.status_code == 401:
                raise GenerationProviderError(
                    "OpenRouter API key is invalid or unauthorized.",
                    401,
                )

            if response.status_code == 402:
                raise GenerationProviderError(
                    "OpenRouter could not provide the requested model "
                    "within the available free quota.",
                    402,
                )

            try:
                error_payload = response.json()

                provider_message = (
                    error_payload
                    .get("error", {})
                    .get("message")
                )

            except (
                ValueError,
                AttributeError,
            ):
                provider_message = None

            if provider_message:
                raise GenerationProviderError(
                    f"OpenRouter request failed: {provider_message}",
                    response.status_code,
                )

            raise GenerationProviderError(
                "OpenRouter generation request failed.",
                response.status_code,
            )

        try:
            payload = response.json()

            output = (
                payload["choices"][0]
                ["message"]["content"]
            )

            if not isinstance(output, str):
                raise GenerationProviderError(
                    "OpenRouter returned an unusable response."
                )

            return self._extract_json(output)

        except GenerationProviderError:
            raise

        except (
            ValueError,
            KeyError,
            IndexError,
            TypeError,
        ):
            raise GenerationProviderError(
                "OpenRouter returned malformed response data."
            ) from None


def get_generation_provider() -> GenerationProvider:
    openrouter_key = (
        settings.openrouter_api_key
        or ""
    ).strip()

    openrouter_model = (
        settings.openrouter_model
        or ""
    ).strip()

    if openrouter_key and openrouter_model:
        return OpenRouterGenerationProvider(
            openrouter_key,
            openrouter_model,
            settings.generation_timeout_seconds,
        )

    gemini_key = (
        settings.gemini_api_key
        or ""
    ).strip()

    gemini_model = (
        settings.gemini_model
        or ""
    ).strip()

    if gemini_key and gemini_model:
        return GeminiGenerationProvider(
            gemini_key,
            gemini_model,
            settings.generation_timeout_seconds,
        )

    raise GenerationProviderError(
        "RAG generation provider is not configured",
        503,
    )