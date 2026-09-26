from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes.documents import router as documents_router
from app.api.routes.embeddings import router as embeddings_router
from app.api.routes.topics import router as topics_router
from app.core.config import settings
from app.core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
)
from app.schemas.common import HealthResponse, RootResponse

app = FastAPI(
    title=settings.app_name,
    description="AI, NLP and document intelligence service for ExamScope AI.",
    version=settings.app_version,
    debug=settings.debug,
)

app.add_exception_handler(
    StarletteHTTPException,
    http_exception_handler,
)

app.add_exception_handler(
    RequestValidationError,
    validation_exception_handler,
)

app.include_router(
    documents_router,
    prefix=settings.api_prefix,
)

app.include_router(
    embeddings_router,
    prefix=settings.api_prefix,
)

app.include_router(
    topics_router,
    prefix=settings.api_prefix,
)


@app.get("/", response_model=RootResponse)
def root():
    return {
        "message": f"{settings.app_name} is running",
        "environment": settings.environment,
    }


@app.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
    }