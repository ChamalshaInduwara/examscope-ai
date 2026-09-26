from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.schemas.common import ErrorResponse
from app.schemas.embeddings import (
    DuplicateDetectionResult,
    SimilarityRequest,
    SimilarityResult,
)
from app.services.document_extractor import (
    SUPPORTED_EXTENSIONS,
    extract_document,
)
from app.services.embedding_service import (
    calculate_similarity,
    detect_duplicate_questions,
)
from app.services.question_intelligence import analyze_questions
from app.services.text_cleaner import clean_document


router = APIRouter(
    prefix="/embeddings",
    tags=["Embeddings"],
)


@router.post(
    "/similarity",
    response_model=SimilarityResult,
    summary="Calculate semantic similarity between two texts",
)
async def compare_text_similarity(
    request: SimilarityRequest,
):
    try:
        score = calculate_similarity(
            request.text_a,
            request.text_b,
        )

        return SimilarityResult(
            text_a=request.text_a,
            text_b=request.text_b,
            similarity_score=score,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


@router.post(
    "/duplicates",
    response_model=DuplicateDetectionResult,
    summary="Detect duplicate questions in a document",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid document",
        },
        415: {
            "model": ErrorResponse,
            "description": "Unsupported file type",
        },
    },
)
async def detect_document_duplicates(
    file: UploadFile = File(...),
    threshold: float = Query(
        default=0.70,
        ge=0,
        le=1,
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

        questions = analyze_questions(cleaned)

        return detect_duplicate_questions(
            questions,
            threshold=threshold,
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