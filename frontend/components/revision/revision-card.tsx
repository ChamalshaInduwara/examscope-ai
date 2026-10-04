"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Star,
} from "lucide-react";

import {
  removeRevisionItem,
  updateRevisionNote,
  toggleRevisionImportant,
} from "@/lib/actions/revision";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RevisionCardProps = {
  item: {
    id: string;
    note: string | null;
    important: boolean;

    subject: {
      name: string;
      code: string | null;
    };

    generatedQuestion: {
      questionText: string;
      type: string;
      difficulty: string;
      marks: number | null;

      answer: {
        answerText: string;
        explanation: string | null;
        keyPoints: string | null;
        marksGuidance: string | null;
      } | null;
    } | null;
  };
};

function parseKeyPoints(
  value: string | null,
) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string =>
            typeof item === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function RevisionCard({
  item,
}: RevisionCardProps) {
  const [showAnswer, setShowAnswer] =
    useState(false);

  const [important, setImportant] =
    useState(item.important);

  const [isUpdatingImportant, setIsUpdatingImportant] =
    useState(false);

  const [isRemoving, setIsRemoving] =
    useState(false);

  const [note, setNote] =
    useState(item.note ?? "");

  const [isSavingNote, setIsSavingNote] =
    useState(false);

  const [noteMessage, setNoteMessage] =
    useState<string | null>(null);

  async function handleToggleImportant() {
    setIsUpdatingImportant(true);

    try {
      const result =
        await toggleRevisionImportant(
          item.id,
        );

      setImportant(
        result.important,
      );
    } catch (error) {
      console.error(
        "Unable to update revision importance:",
        error,
      );
    } finally {
      setIsUpdatingImportant(false);
    }
  }

  async function handleSaveNote() {
    setIsSavingNote(true);
    setNoteMessage(null);

    try {
      await updateRevisionNote(
        item.id,
        note,
      );

      setNoteMessage(
        "Note saved.",
      );
    } catch (error) {
      setNoteMessage(
        error instanceof Error
          ? error.message
          : "Unable to save note.",
      );
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleRemove() {
    const confirmed = window.confirm(
      "Remove this question from saved revision?",
    );

    if (!confirmed) {
      return;
    }

    setIsRemoving(true);

    try {
      await removeRevisionItem(
        item.id,
      );
    } catch (error) {
      console.error(
        "Unable to remove revision item:",
        error,
      );

      setIsRemoving(false);
    }
  }

  const question =
    item.generatedQuestion;

  if (!question) {
    return null;
  }

  const keyPoints =
    parseKeyPoints(
      question.answer?.keyPoints ??
        null,
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">
              {question.questionText}
            </CardTitle>

            <CardDescription className="mt-2">
              {item.subject.name}
              {item.subject.code
                ? ` (${item.subject.code})`
                : ""}
            </CardDescription>
          </div>

          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border px-2 py-1">
              {question.type}
            </span>

            <span className="rounded-full border px-2 py-1">
              {question.difficulty}
            </span>

            {question.marks ? (
              <span className="rounded-full border px-2 py-1">
                {question.marks}{" "}
                {question.marks === 1
                  ? "mark"
                  : "marks"}
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setShowAnswer(
                (current) =>
                  !current,
              )
            }
          >
            {showAnswer ? (
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
            onClick={
              handleToggleImportant
            }
            disabled={
              isUpdatingImportant
            }
          >
            <Star
              className={
                important
                  ? "size-4 fill-current"
                  : "size-4"
              }
            />

            {important
              ? "Important"
              : "Mark Important"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving
              ? "Removing..."
              : "Remove"}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">
            Revision Note
          </p>

          <Input
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            placeholder="Add a short revision note..."
          />

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveNote}
              disabled={isSavingNote}
            >
              {isSavingNote
                ? "Saving..."
                : "Save Note"}
            </Button>

            {noteMessage ? (
              <p className="text-sm text-muted-foreground">
                {noteMessage}
              </p>
            ) : null}
          </div>
        </div>

        {showAnswer &&
        question.answer ? (
          <div className="space-y-4 rounded-md border bg-muted/30 p-4">
            <div>
              <p className="text-sm font-semibold">
                Answer
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {
                  question.answer
                    .answerText
                }
              </p>
            </div>

            {question.answer
              .explanation ? (
              <div>
                <p className="text-sm font-semibold">
                  Explanation
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {
                    question.answer
                      .explanation
                  }
                </p>
              </div>
            ) : null}

            {keyPoints.length > 0 ? (
              <div>
                <p className="text-sm font-semibold">
                  Key Points
                </p>

                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {keyPoints.map(
                    (
                      point,
                      index,
                    ) => (
                      <li
                        key={`${point}-${index}`}
                      >
                        {point}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            ) : null}

            {question.answer
              .marksGuidance ? (
              <div>
                <p className="text-sm font-semibold">
                  Marks Guidance
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {
                    question.answer
                      .marksGuidance
                  }
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

      </CardContent>
    </Card>
  );
}