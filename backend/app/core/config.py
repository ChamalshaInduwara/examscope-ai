from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ExamScope AI API"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    api_prefix: str = "/api/v1"

    gemini_api_key: str | None = Field(default=None, repr=False)
    gemini_model: str | None = None
    openrouter_api_key: str | None = Field(default=None, repr=False)
    openrouter_model: str = "openrouter/free"
    generation_timeout_seconds: float = Field(
        default=30.0,
        gt=0,
        allow_inf_nan=False,
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()