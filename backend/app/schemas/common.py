from pydantic import BaseModel


class RootResponse(BaseModel):
    message: str
    environment: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    detail: str | None = None