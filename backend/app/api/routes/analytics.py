from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.schemas.analytics import HistoricalAnalyticsResult
from app.schemas.common import ErrorResponse
from app.services.analytics_service import analyze_historical_patterns
from app.services.document_extractor import (
    SUPPORTED_EXTENSIONS,
    extract_document,
)
from app.services.question_intelligence import (
    analyze_questions,
    detect_year,
)
from app.services.text_cleaner import clean_document
from app.services.topic_discovery import discover_topics


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.post(
    "/historical",
    response_model=HistoricalAnalyticsResult,
    summary="Analyze historical patterns across past papers",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Invalid historical paper set",
        },
        415: {
            "model": ErrorResponse,
            "description": "Unsupported file type",
        },
    },
)
async def analyze_historical_papers(
    file_1: UploadFile = File(
        ...,
        description="First past paper",
    ),
    file_2: UploadFile = File(
        ...,
        description="Second past paper",
    ),
    file_3: UploadFile = File(
        ...,
        description="Third past paper",
    ),
    max_topics: int = Query(
        default=10,
        ge=1,
        le=30,
    ),
):
    files = [
        file_1,
        file_2,
        file_3,
    ]

    temporary_paths: list[Path] = []

    papers = []
    topic_results = []

    try:
        for upload in files:
            filename = upload.filename or "uploaded_file"
            extension = Path(filename).suffix.lower()

            if extension not in SUPPORTED_EXTENSIONS:
                raise HTTPException(
                    status_code=415,
                    detail=(
                        f"Unsupported file type for "
                        f"{filename}: "
                        f"{extension or 'unknown'}"
                    ),
                )

            file_content = await upload.read()

            if not file_content:
                raise HTTPException(
                    status_code=400,
                    detail=f"{filename} is empty",
                )

            with NamedTemporaryFile(
                delete=False,
                suffix=extension,
            ) as temporary_file:
                temporary_file.write(file_content)

                temporary_path = Path(
                    temporary_file.name
                )

                temporary_paths.append(
                    temporary_path
                )

            extracted = extract_document(
                temporary_path
            )

            extracted = extracted.model_copy(
                update={
                    "filename": filename,
                }
            )

            cleaned = clean_document(
                extracted
            )

            questions = analyze_questions(
                cleaned
            )

            # If the paper text does not contain a year,
            # try to detect it from the filename.
            if questions.year is None:
                filename_year = detect_year(
                    filename
                )

                if filename_year is not None:
                    questions = questions.model_copy(
                        update={
                            "year": filename_year,
                        }
                    )

            if questions.year is None:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Could not determine year for "
                        f"{filename}. Include a four-digit "
                        f"year in the paper or filename."
                    ),
                )

            topics = discover_topics(
                cleaned,
                questions,
                max_topics=max_topics,
            )

            papers.append(
                questions
            )

            topic_results.append(
                topics
            )

        return analyze_historical_patterns(
            papers,
            topic_results,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    finally:
        for upload in files:
            await upload.close()

        for temporary_path in temporary_paths:
            temporary_path.unlink(
                missing_ok=True
            )