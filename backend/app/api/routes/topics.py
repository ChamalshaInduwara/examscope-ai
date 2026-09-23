from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.schemas.common import ErrorResponse
from app.schemas.topics import TopicDiscoveryResult
from app.services.document_extractor import (
    SUPPORTED_EXTENSIONS,
    extract_document,
)
from app.services.question_intelligence import analyze_questions
from app.services.text_cleaner import clean_document
from app.services.topic_discovery import discover_topics


router = APIRouter(
    prefix="/topics",
    tags=["Topics"],
)


@router.post(
    "/discover",
    response_model=TopicDiscoveryResult,
    summary="Discover topics and map questions",
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
async def discover_document_topics(
    file: UploadFile = File(...),
    max_topics: int = Query(
        default=10,
        ge=1,
        le=30,
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

        result = discover_topics(
            cleaned,
            questions,
            max_topics=max_topics,
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