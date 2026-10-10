"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, WandSparkles } from "lucide-react";

import {
  generateStudyQuestions,
  type StudyGenerationResult,
} from "@/lib/actions/generation";
import { saveQuestionForRevision } from "@/lib/actions/revision";
import type {
  RagDifficulty,
  RagMode,
} from "@/lib/api/fastapi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SubjectOption = {
  id: string;
  name: string;
  code: string | null;
};

type DocumentOption = {
  id: string;
  title: string;
  fileName: string;
  subjectId: string;
};

type QuestionGeneratorFormProps = {
  subjects: SubjectOption[];
  documents: DocumentOption[];
};

export function QuestionGeneratorForm({
  subjects,
  documents,
}: QuestionGeneratorFormProps) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");

  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<RagMode>("mcq");

  const [difficulty, setDifficulty] = useState<RagDifficulty>("medium");

  const [count, setCount] = useState(5);

  const [result, setResult] = useState<StudyGenerationResult | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);

  const [savingRevisionIndex, setSavingRevisionIndex] =
    useState<number | null>(null);

  const [savedRevisionIndexes, setSavedRevisionIndexes] = useState<number[]>(
    [],
  );

  const [revisionMessage, setRevisionMessage] = useState<string | null>(null);

  const subjectDocuments = useMemo(
    () => documents.filter((document) => document.subjectId === subjectId),
    [documents, subjectId],
  );

  function handleSubjectChange(value: string) {
    setSubjectId(value);
    setSelectedDocumentIds([]);
    setResult(null);
    setError(null);
    setSavedRevisionIndexes([]);
    setRevisionMessage(null);
  }

  function toggleDocument(documentId: string) {
    setSelectedDocumentIds((current) => {
      if (current.includes(documentId)) {
        return current.filter((id) => id !== documentId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, documentId];
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setResult(null);
    setRevealedAnswers([]);
    setSavedRevisionIndexes([]);
    setRevisionMessage(null);

    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    if (selectedDocumentIds.length === 0) {
      setError("Select at least one source document.");
      return;
    }

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setIsLoading(true);

    try {
      const generationResult = await generateStudyQuestions({
        subjectId,
        documentIds: selectedDocumentIds,
        topic,
        mode,
        difficulty,
        count,
      });

      setResult(generationResult);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to generate questions.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function toggleAnswer(index: number) {
    setRevealedAnswers((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  }

  async function handleSaveForRevision(
    generatedQuestionId: string | undefined,
    index: number,
  ) {
    if (!generatedQuestionId) {
      setRevisionMessage(
        "This generated question has not been saved yet.",
      );
      return;
    }

    setSavingRevisionIndex(index);
    setRevisionMessage(null);

    try {
      const response = await saveQuestionForRevision(generatedQuestionId);

      setSavedRevisionIndexes((current) =>
        current.includes(index) ? current : [...current, index],
      );

      setRevisionMessage(response.message);
    } catch (error) {
      setRevisionMessage(
        error instanceof Error
          ? error.message
          : "Unable to save question for revision.",
      );
    } finally {
      setSavingRevisionIndex(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>

        <select
          id="subject"
          value={subjectId}
          onChange={(event) => handleSubjectChange(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
              {subject.code ? ` (${subject.code})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Source documents</Label>

          <p className="mt-1 text-xs text-muted-foreground">
            Select between one and three documents.
          </p>
        </div>

        {subjectDocuments.length === 0 ? (
          <p className="rounded-md border p-4 text-sm text-muted-foreground">
            No documents are available for this subject.
          </p>
        ) : (
          <div className="space-y-2">
            {subjectDocuments.map((document) => {
              const checked = selectedDocumentIds.includes(document.id);

              const disabled = !checked && selectedDocumentIds.length >= 3;

              return (
                <label
                  key={document.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleDocument(document.id)}
                    className="mt-1"
                  />

                  <div>
                    <p className="text-sm font-medium">{document.title}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {document.fileName}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>

        <Input
          id="topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g. Photosynthesis"
          maxLength={500}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="mode">Question type</Label>

          <select
            id="mode"
            value={mode}
            onChange={(event) => setMode(event.target.value as RagMode)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="mcq">MCQ</option>

            <option value="structured">Structured</option>

            <option value="essay">Essay</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>

          <select
            id="difficulty"
            value={difficulty}
            onChange={(event) =>
              setDifficulty(event.target.value as RagDifficulty)
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="easy">Easy</option>

            <option value="medium">Medium</option>

            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="count">Number of questions</Label>

        <Input
          id="count"
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={(event) =>
            setCount(Math.min(10, Math.max(1, Number(event.target.value) || 1)))
          }
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {result ? (
        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <p className="font-medium">Generation completed</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Generated {result.generated_count} of {result.requested_count}{" "}
              requested questions.
            </p>

            {result.reason ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {result.reason}
              </p>
            ) : null}
          </div>

          {revisionMessage ? (
            <p className="text-sm text-muted-foreground">
              {revisionMessage}
            </p>
          ) : null}

          {result.mode === "mcq"
            ? result.questions.map((question, index) => {
                if (!("options" in question)) {
                  return null;
                }

                const isRevealed = revealedAnswers.includes(index);

                const evidence = result.retrieved_evidence.filter((item) =>
                  question.source_evidence_ids.includes(item.evidence_id),
                );

                return (
                  <div
                    key={`${question.question_text}-${index}`}
                    className="rounded-lg border p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </p>

                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border px-2 py-1 capitalize">
                          {question.difficulty}
                        </span>

                        <span className="rounded-full border px-2 py-1">
                          {question.marks}{" "}
                          {question.marks === 1 ? "mark" : "marks"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 font-medium leading-7">
                      {question.question_text}
                    </p>

                    <div className="mt-4 space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option.label}
                          className="flex gap-3 rounded-md border p-3 text-sm"
                        >
                          <span className="font-semibold">{option.label}.</span>

                          <span>{option.text}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => toggleAnswer(index)}
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="size-4" />
                          Hide Answer
                        </>
                      ) : (
                        <>
                          <Eye className="size-4" />
                          Show Answer
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 ml-2"
                      disabled={
                        savingRevisionIndex === index ||
                        savedRevisionIndexes.includes(index)
                      }
                      onClick={() =>
                        handleSaveForRevision(
                          question.generatedQuestionId,
                          index,
                        )
                      }
                    >
                      {savingRevisionIndex === index
                        ? "Saving..."
                        : savedRevisionIndexes.includes(index)
                          ? "Saved for Revision"
                          : "Save for Revision"}
                    </Button>

                    {isRevealed ? (
                      <div className="mt-4 space-y-4 rounded-md border bg-muted/30 p-4">
                        <div>
                          <p className="text-sm font-semibold">
                            Correct Answer
                          </p>

                          <p className="mt-1 text-sm">
                            {question.correct_option}. {question.answer_text}
                          </p>
                        </div>

                        {question.explanation ? (
                          <div>
                            <p className="text-sm font-semibold">Explanation</p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {question.explanation}
                            </p>
                          </div>
                        ) : null}

                        {question.key_points.length > 0 ? (
                          <div>
                            <p className="text-sm font-semibold">Key Points</p>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                              {question.key_points.map(
                                (keyPoint, keyPointIndex) => (
                                  <li key={`${keyPoint}-${keyPointIndex}`}>
                                    {keyPoint}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        ) : null}

                        {evidence.length > 0 ? (
                          <div>
                            <p className="text-sm font-semibold">
                              Source Evidence
                            </p>

                            <div className="mt-2 space-y-2">
                              {evidence.map((item) => (
                                <div
                                  key={item.evidence_id}
                                  className="rounded-md border bg-background p-3"
                                >
                                  <p className="text-xs font-medium">
                                    {item.filename}
                                  </p>

                                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    {item.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })
            : null}

          {result.mode === "structured"
            ? result.questions.map((question, index) => {
                if (!("parts" in question)) {
                  return null;
                }

                const isRevealed = revealedAnswers.includes(index);

                const evidence = result.retrieved_evidence.filter((item) =>
                  question.source_evidence_ids.includes(item.evidence_id),
                );

                return (
                  <div
                    key={`${question.question_text}-${index}`}
                    className="rounded-lg border p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </p>

                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border px-2 py-1 capitalize">
                          {question.difficulty}
                        </span>

                        <span className="rounded-full border px-2 py-1">
                          {question.total_marks}{" "}
                          {question.total_marks === 1 ? "mark" : "marks"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 font-medium leading-7">
                      {question.question_text}
                    </p>

                    {question.parts.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {question.parts.map((part, partIndex) => (
                          <div
                            key={`${part.label}-${partIndex}`}
                            className="rounded-md border p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex gap-2">
                                <span className="font-semibold">
                                  {part.label}
                                </span>

                                <p className="text-sm leading-6">
                                  {part.question_text}
                                </p>
                              </div>

                              <span className="shrink-0 text-xs text-muted-foreground">
                                {part.marks}{" "}
                                {part.marks === 1 ? "mark" : "marks"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => toggleAnswer(index)}
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="size-4" />
                          Hide Answer
                        </>
                      ) : (
                        <>
                          <Eye className="size-4" />
                          Show Answer
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 ml-2"
                      disabled={
                        savingRevisionIndex === index ||
                        savedRevisionIndexes.includes(index)
                      }
                      onClick={() =>
                        handleSaveForRevision(
                          question.generatedQuestionId,
                          index,
                        )
                      }
                    >
                      {savingRevisionIndex === index
                        ? "Saving..."
                        : savedRevisionIndexes.includes(index)
                          ? "Saved for Revision"
                          : "Save for Revision"}
                    </Button>

                    {isRevealed ? (
                      <div className="mt-4 space-y-5 rounded-md border bg-muted/30 p-4">
                        {question.parts.length > 0 ? (
                          <div>
                            <p className="text-sm font-semibold">
                              Part Answers
                            </p>

                            <div className="mt-3 space-y-3">
                              {question.parts.map((part, partIndex) => (
                                <div
                                  key={`${part.label}-answer-${partIndex}`}
                                  className="rounded-md border bg-background p-3"
                                >
                                  <p className="text-sm font-semibold">
                                    {part.label}
                                  </p>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {part.answer}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div>
                          <p className="text-sm font-semibold">Full Answer</p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {question.answer_text}
                          </p>
                        </div>

                        {question.explanation ? (
                          <div>
                            <p className="text-sm font-semibold">Explanation</p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {question.explanation}
                            </p>
                          </div>
                        ) : null}

                        {question.key_points.length > 0 ? (
                          <div>
                            <p className="text-sm font-semibold">Key Points</p>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                              {question.key_points.map(
                                (keyPoint, keyPointIndex) => (
                                  <li key={`${keyPoint}-${keyPointIndex}`}>
                                    {keyPoint}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        ) : null}

                        {question.marks_guidance ? (
                          <div>
                            <p className="text-sm font-semibold">
                              Marks Guidance
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {question.marks_guidance}
                            </p>
                          </div>
                        ) : null}

                        {evidence.length > 0 ? (
                          <div>
                            <p className="text-sm font-semibold">
                              Source Evidence
                            </p>

                            <div className="mt-2 space-y-2">
                              {evidence.map((item) => (
                                <div
                                  key={item.evidence_id}
                                  className="rounded-md border bg-background p-3"
                                >
                                  <p className="text-xs font-medium">
                                    {item.filename}
                                  </p>

                                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    {item.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })
            : null}

          {result.mode === "essay"
            ? result.questions.map((question, index) => {
                if (!("outline" in question)) {
                  return null;
                }

                const isRevealed = revealedAnswers.includes(index);

                const evidence = result.retrieved_evidence.filter((item) =>
                  question.source_evidence_ids.includes(item.evidence_id),
                );

                return (
                  <div
                    key={`${question.question_text}-${index}`}
                    className="rounded-lg border p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </p>

                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border px-2 py-1 capitalize">
                          {question.difficulty}
                        </span>

                        <span className="rounded-full border px-2 py-1">
                          {question.marks}{" "}
                          {question.marks === 1 ? "mark" : "marks"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 font-medium leading-7">
                      {question.question_text}
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4"
                      onClick={() => toggleAnswer(index)}
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="size-4" />
                          Hide Answer
                        </>
                      ) : (
                        <>
                          <Eye className="size-4" />
                          Show Answer
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 ml-2"
                      disabled={
                        savingRevisionIndex === index ||
                        savedRevisionIndexes.includes(index)
                      }
                      onClick={() =>
                        handleSaveForRevision(
                          question.generatedQuestionId,
                          index,
                        )
                      }
                    >
                      {savingRevisionIndex === index
                        ? "Saving..."
                        : savedRevisionIndexes.includes(index)
                          ? "Saved for Revision"
                          : "Save for Revision"}
                    </Button>

                    {isRevealed ? (
                      <div className="mt-4 space-y-5 rounded-md border bg-muted/30 p-4">
                        {question.outline.length > 0 ? (
                          <div>
                            <p className="text-sm font-semibold">
                              Answer Outline
                            </p>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                              {question.outline.map((point, pointIndex) => (
                                <li key={`${point}-${pointIndex}`}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div>
                          <p className="text-sm font-semibold">Model Answer</p>

                          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                            {question.model_answer}
                          </p>
                        </div>

                        {question.explanation ? (
                          <div>
                            <p className="text-sm font-semibold">Explanation</p>

                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {question.explanation}
                            </p>
                          </div>
                        ) : null}

                        {question.key_points.length > 0 ? (
                          <div>
                            <p className="text-sm font-semibold">Key Points</p>

                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                              {question.key_points.map(
                                (keyPoint, keyPointIndex) => (
                                  <li key={`${keyPoint}-${keyPointIndex}`}>
                                    {keyPoint}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        ) : null}

                        {question.marks_guidance ? (
                          <div>
                            <p className="text-sm font-semibold">
                              Marks Guidance
                            </p>

                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {question.marks_guidance}
                            </p>
                          </div>
                        ) : null}

                        {evidence.length > 0 ? (
                          <div>
                            <p className="text-sm font-semibold">
                              Source Evidence
                            </p>

                            <div className="mt-2 space-y-2">
                              {evidence.map((item) => (
                                <div
                                  key={item.evidence_id}
                                  className="rounded-md border bg-background p-3"
                                >
                                  <p className="text-xs font-medium">
                                    {item.filename}
                                  </p>

                                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    {item.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })
            : null}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isLoading || !subjectId || subjectDocuments.length === 0}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <WandSparkles className="size-4" />
            Generate Questions
          </>
        )}
      </Button>
    </form>
  );
}
