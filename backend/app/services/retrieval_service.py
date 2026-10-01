"""Batch semantic retrieval using the existing cached embedding model."""
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas.processing import ChunkingResult
from app.schemas.rag import RetrievedEvidence, RetrievalResult
from app.services.embedding_service import get_embedding_model


def retrieve_relevant_chunks(
    documents: list[ChunkingResult],
    query: str,
    top_k: int = 5,
    minimum_relevance: float = 0.25,
) -> RetrievalResult:
    query = query.strip()
    if not query:
        raise ValueError("Query cannot be blank")
    if top_k <= 0:
        raise ValueError("top_k must be greater than zero")
    if not 0 <= minimum_relevance <= 1:
        raise ValueError("minimum_relevance must be between 0 and 1")

    candidates = [(doc.filename, chunk) for doc in documents for chunk in doc.chunks]
    ranked = []
    if candidates:
        embeddings = get_embedding_model().encode(
            [query] + [chunk.text for _, chunk in candidates],
            normalize_embeddings=True,
        )
        scores = cosine_similarity(embeddings[:1], embeddings[1:])[0]
        for (filename, chunk), raw_score in zip(candidates, scores):
            score = min(1.0, max(-1.0, float(raw_score)))
            # Apply the threshold before rounding for display.
            if score >= minimum_relevance:
                ranked.append((score, filename, chunk))
        ranked.sort(key=lambda item: (-item[0], item[1], item[2].chunk_index))

    evidence = [
        RetrievedEvidence(
            evidence_id=f"E{index}", filename=filename,
            chunk_index=chunk.chunk_index, text=chunk.text,
            relevance_score=round(score, 4),
            source_references=chunk.source_references,
        )
        for index, (score, filename, chunk) in enumerate(ranked[:top_k], start=1)
    ]
    return RetrievalResult(
        query=query, total_candidate_chunks=len(candidates),
        total_retrieved=len(evidence), top_k=top_k,
        minimum_relevance=minimum_relevance, evidence=evidence,
    )
