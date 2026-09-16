from app.schemas.processing import (
	ChunkingResult,
	CleaningResult,
	SourceReference,
	TextChunk,
)


def chunk_document(
	document: CleaningResult,
	chunk_size_words: int = 120,
	overlap_words: int = 20,
) -> ChunkingResult:
	if chunk_size_words <= 0:
		raise ValueError("Chunk size must be greater than 0")

	if overlap_words < 0:
		raise ValueError("Overlap cannot be negative")

	if overlap_words >= chunk_size_words:
		raise ValueError(
			"Overlap must be smaller than chunk size"
		)

	words_with_references: list[
		tuple[str, SourceReference]
	] = []

	for segment in document.segments:
		reference = SourceReference(
			reference_type=segment.reference_type,
			reference_number=segment.reference_number,
		)

		for word in segment.text.split():
			words_with_references.append(
				(word, reference)
			)

	chunks: list[TextChunk] = []

	if not words_with_references:
		return ChunkingResult(
			filename=document.filename,
			file_type=document.file_type,
			total_chunks=0,
			chunk_size_words=chunk_size_words,
			overlap_words=overlap_words,
			chunks=[],
		)

	step_size = chunk_size_words - overlap_words
	start = 0
	chunk_index = 1

	while start < len(words_with_references):
		end = min(
			start + chunk_size_words,
			len(words_with_references),
		)

		chunk_items = words_with_references[start:end]

		chunk_text = " ".join(
			word for word, _ in chunk_items
		)

		source_references: list[SourceReference] = []
		seen_references: set[tuple[str, int]] = set()

		for _, reference in chunk_items:
			key = (
				reference.reference_type,
				reference.reference_number,
			)

			if key not in seen_references:
				seen_references.add(key)
				source_references.append(reference)

		chunks.append(
			TextChunk(
				chunk_index=chunk_index,
				text=chunk_text,
				word_count=len(chunk_items),
				source_references=source_references,
			)
		)

		if end == len(words_with_references):
			break

		start += step_size
		chunk_index += 1

	return ChunkingResult(
		filename=document.filename,
		file_type=document.file_type,
		total_chunks=len(chunks),
		chunk_size_words=chunk_size_words,
		overlap_words=overlap_words,
		chunks=chunks,
	)
