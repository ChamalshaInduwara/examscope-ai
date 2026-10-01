"""Multipart HTTP entry points for retrieval and grounded generation."""
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from starlette.concurrency import run_in_threadpool

from app.schemas.common import ErrorResponse
from app.schemas.processing import ChunkingResult
from app.schemas.rag import (
    GenerationRequest, GenerationResult, RAGDifficulty, RAGMode, RetrievalResult,
)
from app.services.document_extractor import SUPPORTED_EXTENSIONS, extract_document
from app.services.generation_provider import GenerationProviderError
from app.services.rag_service import generate_questions
from app.services.retrieval_service import retrieve_relevant_chunks
from app.services.text_chunker import chunk_document
from app.services.text_cleaner import clean_document

router = APIRouter(prefix="/rag", tags=["RAG"])
ERROR_RESPONSES = {
    400: {"model": ErrorResponse, "description": "Invalid or empty document/input"},
    415: {"model": ErrorResponse, "description": "Unsupported file type"},
    422: {"model": ErrorResponse, "description": "Request validation failed"},
}


def _process_upload(upload: UploadFile) -> ChunkingResult:
    filename = upload.filename or "uploaded_file"
    extension = Path(filename).suffix.lower()
    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(415, f"Unsupported file type: {extension or 'unknown'}")
    temporary_path = None
    invalid_document = False
    chunked = None
    try:
        with NamedTemporaryFile(delete=False, suffix=extension) as temporary_file:
            temporary_path = Path(temporary_file.name)
            # Stream to disk rather than making another full copy in memory.
            while content := upload.file.read(1024 * 1024):
                temporary_file.write(content)
            if temporary_file.tell() == 0:
                raise HTTPException(400, "Uploaded file is empty")
        extracted = extract_document(temporary_path).model_copy(update={"filename": filename})
        chunked = chunk_document(clean_document(extracted))
        if not chunked.chunks:
            raise HTTPException(400, "Uploaded document contains no usable text")
    except ValueError:
        # Leave the exception scope before unlinking: extraction tracebacks can
        # retain a failed PDF reader and its Windows file handle.
        invalid_document = True
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)
    if invalid_document:
        raise HTTPException(400, "Uploaded document is invalid or could not be extracted")
    return chunked


async def _process_documents(*uploads: UploadFile | None) -> list[ChunkingResult]:
    try:
        return [
            await run_in_threadpool(_process_upload, upload)
            for upload in uploads if upload is not None
        ]
    finally:
        for upload in uploads:
            if upload is not None:
                await upload.close()


@router.post("/retrieve", response_model=RetrievalResult, responses=ERROR_RESPONSES)
async def retrieve(
    file_1: UploadFile = File(..., json_schema_extra={"type": "string", "format": "binary"}),
    file_2: UploadFile | None = File(None, json_schema_extra={"type": "string", "format": "binary"}),
    file_3: UploadFile | None = File(None, json_schema_extra={"type": "string", "format": "binary"}),
    query: str = Form(..., min_length=1, max_length=700),
    top_k: int = Query(5, ge=1, le=20),
    minimum_relevance: float = Query(0.25, ge=0, le=1),
):
    if not query.strip():
        raise HTTPException(400, "Query cannot be blank")
    documents = await _process_documents(file_1, file_2, file_3)
    return await run_in_threadpool(
        retrieve_relevant_chunks, documents, query, top_k, minimum_relevance,
    )


@router.post(
    "/generate", response_model=GenerationResult,
    responses={**ERROR_RESPONSES,
               502: {"model": ErrorResponse, "description": "Invalid provider response"},
               503: {"model": ErrorResponse, "description": "Provider is not configured"},
               504: {"model": ErrorResponse, "description": "Provider timeout"}},
)
async def generate(
    file_1: UploadFile = File(..., json_schema_extra={"type": "string", "format": "binary"}),
    file_2: UploadFile | None = File(None, json_schema_extra={"type": "string", "format": "binary"}),
    file_3: UploadFile | None = File(None, json_schema_extra={"type": "string", "format": "binary"}),
    topic: str = Form(..., min_length=1, max_length=500),
    mode: RAGMode = Form(...),
    difficulty: RAGDifficulty = Form("medium"),
    subject_name: str | None = Form(None, max_length=200),
    count: int = Query(5, ge=1, le=10),
    top_k: int = Query(5, ge=1, le=20),
    minimum_relevance: float = Query(0.25, ge=0, le=1),
):
    if not topic.strip():
        raise HTTPException(400, "Topic cannot be blank")
    request = GenerationRequest(
        subject_name=subject_name, topic=topic, mode=mode, difficulty=difficulty,
        count=count, top_k=top_k, minimum_relevance=minimum_relevance,
    )
    documents = await _process_documents(file_1, file_2, file_3)
    try:
        return await run_in_threadpool(generate_questions, documents, request)
    except GenerationProviderError as exc:
        raise HTTPException(exc.status_code, str(exc)) from None
