from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.common import ErrorResponse
from app.schemas.documents import DocumentExtractionResult
from app.services.document_extractor import (
    SUPPORTED_EXTENSIONS,
    extract_document,
)


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