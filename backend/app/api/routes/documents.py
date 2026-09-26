from pathlib import Path
from tempfile import NamedTemporaryFile

from app.schemas.questions import QuestionIntelligenceResult
from app.services.question_intelligence import analyze_questions

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.schemas.common import ErrorResponse
from app.schemas.documents import DocumentExtractionResult
from app.schemas.processing import DocumentProcessingResult
from app.services.document_extractor import (
    SUPPORTED_EXTENSIONS,
    extract_document,
)
from app.services.question_block_detector import (
    detect_candidate_question_blocks,
)
from app.services.text_chunker import chunk_document
from app.services.text_cleaner import clean_document


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/extract",
    response_model=DocumentExtractionResult,
    summary="Extract text from an academic document",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid or empty document",
        },
        415: {
            "model": ErrorResponse,
            "description": "Unsupported file type",
        },
    },
)
async def extract_uploaded_document(
    file: UploadFile = File(...),
):
    filename = file.filename or "uploaded_file"
    extension = Path(filename).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {extension or 'unknown'}",
        )

    temporary_path: Path | None = None

    try:
        file_content = await file.read()

        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty",
            )

        with NamedTemporaryFile(
            delete=False,
            suffix=extension,
        ) as temporary_file:
            temporary_file.write(file_content)
            temporary_path = Path(temporary_file.name)

        result = extract_document(temporary_path)

        return result.model_copy(
            update={
                "filename": filename,
            }
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    finally:
        await file.close()

        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)


@router.post(
    "/questions/analyze",
    response_model=QuestionIntelligenceResult,
    summary="Analyze questions in a past paper",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid document or year",
        },
        415: {
            "model": ErrorResponse,
            "description": "Unsupported file type",
        },
    },
)
async def analyze_uploaded_questions(
    file: UploadFile = File(...),
    year: int | None = Query(
        default=None,
        ge=1900,
        le=2100,
    ),
):
    filename = file.filename or "uploaded_file"
    extension = Path(filename).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {extension or 'unknown'}",
        )

    temporary_path: Path | None = None

    try:
        file_content = await file.read()

        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty",
            )

        with NamedTemporaryFile(
            delete=False,
            suffix=extension,
        ) as temporary_file:
            temporary_file.write(file_content)
            temporary_path = Path(temporary_file.name)

        extracted = extract_document(temporary_path)

        extracted = extracted.model_copy(
            update={
                "filename": filename,
            }
        )

        cleaned = clean_document(extracted)

        result = analyze_questions(
            cleaned,
            year=year,
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    finally:
        await file.close()

        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)

@router.post(
    "/process",
    response_model=DocumentProcessingResult,
    summary="Extract, clean and chunk an academic document",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid document or processing configuration",
        },
        415: {
            "model": ErrorResponse,
            "description": "Unsupported file type",
        },
    },
)
async def process_uploaded_document(
    file: UploadFile = File(...),
    chunk_size_words: int = Query(
        default=120,
        gt=0,
    ),
    overlap_words: int = Query(
        default=20,
        ge=0,
    ),
):
    filename = file.filename or "uploaded_file"
    extension = Path(filename).suffix.lower()

    if extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {extension or 'unknown'}",
        )

    if overlap_words >= chunk_size_words:
        raise HTTPException(
            status_code=400,
            detail="Overlap must be smaller than chunk size",
        )

    temporary_path: Path | None = None

    try:
        file_content = await file.read()

        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty",
            )

        with NamedTemporaryFile(
            delete=False,
            suffix=extension,
        ) as temporary_file:
            temporary_file.write(file_content)
            temporary_path = Path(temporary_file.name)

        extracted = extract_document(temporary_path)

        extracted = extracted.model_copy(
            update={
                "filename": filename,
            }
        )

        cleaned = clean_document(extracted)

        chunked = chunk_document(
            cleaned,
            chunk_size_words=chunk_size_words,
            overlap_words=overlap_words,
        )

        question_blocks = detect_candidate_question_blocks(
            cleaned
        )

        return DocumentProcessingResult(
            cleaning=cleaned,
            chunking=chunked,
            question_blocks=question_blocks,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    finally:
        await file.close()

        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)