"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  FileText,
  Loader2,
  MessageCircleQuestion,
  Send,
} from "lucide-react";

import { askStudyAssistant } from "@/lib/actions/study-assistant";
import type {
  RagRetrievedEvidence,
  StudyAssistantResult,
} from "@/lib/api/fastapi";

import { Button } from "@/components/ui/button";
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

type StudyAssistantChatProps = {
  subjects: SubjectOption[];
  documents: DocumentOption[];
};

type ChatTurn = {
  question: string;
  result: StudyAssistantResult;
};

export function StudyAssistantChat({
  subjects,
  documents,
}: StudyAssistantChatProps) {
  const [subjectId, setSubjectId] = useState(
    subjects[0]?.id ?? "",
  );

  const [selectedDocumentIds, setSelectedDocumentIds] =
    useState<string[]>([]);

  const [question, setQuestion] = useState("");

  const [chatTurns, setChatTurns] = useState<ChatTurn[]>(
    [],
  );

  const [error, setError] = useState<string | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(false);

  const subjectDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          document.subjectId === subjectId,
      ),
    [documents, subjectId],
  );

  function handleSubjectChange(value: string) {
    setSubjectId(value);
    setSelectedDocumentIds([]);
    setChatTurns([]);
    setQuestion("");
    setError(null);
  }

  function toggleDocument(documentId: string) {
    setSelectedDocumentIds((current) => {
      if (current.includes(documentId)) {
        return current.filter(
          (id) => id !== documentId,
        );
      }

      if (current.length >= 3) {
        return current;
      }

      return [
        ...current,
        documentId,
      ];
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    setError(null);

    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    if (selectedDocumentIds.length === 0) {
      setError(
        "Select at least one source document.",
      );
      return;
    }

    if (!trimmedQuestion) {
      setError("Please enter a question.");
      return;
    }

    if (trimmedQuestion.length > 1000) {
      setError(
        "Question must not exceed 1000 characters.",
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await askStudyAssistant({
        subjectId,
        documentIds: selectedDocumentIds,
        question: trimmedQuestion,
      });

      setChatTurns((current) => [
        ...current,
        {
          question: trimmedQuestion,
          result,
        },
      ]);

      setQuestion("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to get an answer.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function getCitedEvidence(
    result: StudyAssistantResult,
  ): RagRetrievedEvidence[] {
    const usedIds = new Set(
      result.source_evidence_ids,
    );

    return result.retrieved_evidence.filter(
      (evidence) =>
        usedIds.has(evidence.evidence_id),
    );
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="study-subject">
            Subject
          </Label>

          <select
            id="study-subject"
            value={subjectId}
            onChange={(event) =>
              handleSubjectChange(
                event.target.value,
              )
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {subjects.map((subject) => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.name}
                {subject.code
                  ? ` (${subject.code})`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div>
            <Label>
              Source documents
            </Label>

            <p className="mt-1 text-xs text-muted-foreground">
              Select between one and three processed
              documents.
            </p>
          </div>

          {subjectDocuments.length === 0 ? (
            <p className="rounded-md border p-4 text-sm text-muted-foreground">
              No processed documents are available
              for this subject.
            </p>
          ) : (
            <div className="space-y-2">
              {subjectDocuments.map(
                (document) => {
                  const checked =
                    selectedDocumentIds.includes(
                      document.id,
                    );

                  const disabled =
                    !checked &&
                    selectedDocumentIds.length >= 3;

                  return (
                    <label
                      key={document.id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() =>
                          toggleDocument(
                            document.id,
                          )
                        }
                        className="mt-1"
                      />

                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium">
                          {document.title}
                        </p>

                        <p className="mt-1 break-words text-xs text-muted-foreground">
                          {document.fileName}
                        </p>
                      </div>
                    </label>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-[420px] min-w-0 flex-col rounded-lg border sm:min-h-[480px] lg:min-h-[560px]">
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {chatTurns.length === 0 ? (
            <div className="flex h-full min-h-80 items-center justify-center">
              <div className="max-w-md text-center">
                <MessageCircleQuestion className="mx-auto size-10 text-muted-foreground" />

                <h2 className="mt-4 font-semibold">
                  Ask your first question
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Select your source documents and ask
                  something about the material.
                </p>
              </div>
            </div>
          ) : (
            chatTurns.map((turn, index) => {
              const citedEvidence =
                getCitedEvidence(turn.result);

              return (
                <div
                  key={`${turn.question}-${index}`}
                  className="space-y-3"
                >
                  <div className="ml-auto max-w-[85%] break-words rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground">
                    {turn.question}
                  </div>

                  <div className="max-w-[92%] break-words rounded-lg bg-muted px-4 py-4">
                    {turn.result.status ===
                    "success" ? (
                      <>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {turn.result.answer}
                        </p>

                        {citedEvidence.length >
                          0 && (
                          <div className="mt-4 border-t pt-3">
                            <p className="text-xs font-medium">
                              Sources
                            </p>

                            <div className="mt-2 space-y-2">
                              {citedEvidence.map(
                                (evidence) => (
                                  <details
                                    key={
                                      evidence.evidence_id
                                    }
                                    className="rounded-md border bg-background"
                                  >
                                    <summary className="flex min-w-0 cursor-pointer list-none items-center gap-2 p-3 text-xs font-medium">
                                      <FileText className="size-3.5 shrink-0" />

                                      <span className="min-w-0 break-words">
                                        {evidence.filename}
                                      </span>
                                    </summary>

                                    <div className="border-t px-3 py-3">
                                      <p className="text-xs leading-relaxed text-muted-foreground">
                                        {evidence.text}
                                      </p>
                                    </div>
                                  </details>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {turn.result.reason ??
                          "There was not enough evidence in the selected documents to answer this question."}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex max-w-[92%] items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Searching your study materials...
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t p-4"
        >
          {error && (
            <p className="mb-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="Ask a question about the selected materials..."
              maxLength={1000}
              rows={3}
              disabled={isLoading}
              className="min-h-20 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <Button
              type="submit"
              size="icon"
              disabled={
                isLoading ||
                !question.trim() ||
                selectedDocumentIds.length === 0
              }
              aria-label="Ask Study Assistant"
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Answers are generated from the selected
            documents only. AI responses may still require
            verification.
          </p>
        </form>
      </div>
    </div>
  );
}