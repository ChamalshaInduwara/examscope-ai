from pydantic import BaseModel


class RootResponse(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    detail: str | None = None