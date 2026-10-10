"use client";

import { useMemo, useState } from "react";
import { FilePlus2, Loader2 } from "lucide-react";

import { createMockExam } from "@/lib/actions/mock-exams";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SubjectOption = {
  id: string;
  name: string;
  code: string | null;
};

type GeneratedQuestionOption = {
  id: string;
  questionText: string;
  type: string;
  difficulty: string;
  marks: number | null;
  subjectId: string;
  topic: {
    id: string;
    name: string;
  } | null;
};

type MockExamBuilderProps = {
  subjects: SubjectOption[];
  questions: GeneratedQuestionOption[];
};

export function MockExamBuilder({
  subjects,
  questions,
}: MockExamBuilderProps) {
  const [subjectId, setSubjectId] = useState(
    subjects[0]?.id ?? "",
  );

  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [difficultyFilter, setDifficultyFilter] =
    useState("ALL");

  const [topicFilter, setTopicFilter] =
    useState("ALL");

  const [title, setTitle] =
    useState("");

  const [duration, setDuration] =
    useState(60);

  const [instructions, setInstructions] =
    useState("");

  const [
    selectedQuestionIds,
    setSelectedQuestionIds,
  ] = useState<string[]>([]);

  const [isCreating, setIsCreating] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const subjectQuestions = useMemo(
    () =>
      questions.filter(
        (question) =>
          question.subjectId === subjectId,
      ),
    [questions, subjectId],
  );

  const subjectTopics = useMemo(() => {
    const topics = new Map<string, string>();

    questions
      .filter(
        (question) =>
          question.subjectId === subjectId &&
          question.topic !== null,
      )
      .forEach((question) => {
        if (question.topic) {
          topics.set(
            question.topic.id,
            question.topic.name,
          );
        }
      });

    return [...topics.entries()].sort(
      ([, firstName], [, secondName]) =>
        firstName.localeCompare(secondName),
    );
  }, [questions, subjectId]);

  const filteredQuestions = useMemo(
    () =>
      subjectQuestions.filter((question) => {
        const matchesType =
          typeFilter === "ALL" ||
          question.type === typeFilter;
        const matchesDifficulty =
          difficultyFilter === "ALL" ||
          question.difficulty === difficultyFilter;
        const matchesTopic =
          topicFilter === "ALL" ||
          question.topic?.id === topicFilter;

        return (
          matchesType &&
          matchesDifficulty &&
          matchesTopic
        );
      }),
    [
      subjectQuestions,
      typeFilter,
      difficultyFilter,
      topicFilter,
    ],
  );

  const selectedQuestions = useMemo(
    () =>
      subjectQuestions.filter(
        (question) =>
          selectedQuestionIds.includes(
            question.id,
          ),
      ),
    [
      subjectQuestions,
      selectedQuestionIds,
    ],
  );

  const totalMarks = useMemo(
    () =>
      selectedQuestions.reduce(
        (total, question) =>
          total +
          (question.marks ?? 0),
        0,
      ),
    [selectedQuestions],
  );

  function handleSubjectChange(
    value: string,
  ) {
    setSubjectId(value);
    setSelectedQuestionIds([]);
    setTypeFilter("ALL");
    setDifficultyFilter("ALL");
    setTopicFilter("ALL");
    setError(null);
    setSuccess(null);
  }

  function toggleQuestion(
    questionId: string,
  ) {
    setSelectedQuestionIds(
      (current) =>
        current.includes(questionId)
          ? current.filter(
              (id) =>
                id !== questionId,
            )
          : current.length >= 100
            ? current
            : [
                ...current,
                questionId,
              ],
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!subjectId) {
      setError(
        "Please select a subject.",
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a mock exam title.",
      );
      return;
    }

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 360
    ) {
      setError(
        "Duration must be between 1 and 360 minutes.",
      );
      return;
    }

    if (selectedQuestionIds.length > 100) {
      setError(
        "A mock exam can contain at most 100 questions.",
      );
      return;
    }

    if (
      selectedQuestionIds.length === 0
    ) {
      setError(
        "Select at least one question.",
      );
      return;
    }

    setIsCreating(true);

    try {
      await createMockExam({
        subjectId,
        title,
        duration,
        instructions,
        generatedQuestionIds:
          selectedQuestionIds,
      });

      setSuccess(
        "Mock exam created successfully as a draft.",
      );

      setTitle("");
      setDuration(60);
      setInstructions("");
      setSelectedQuestionIds([]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create mock exam.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="subject">
          Subject
        </Label>

        <select
          id="subject"
          value={subjectId}
          onChange={(event) =>
            handleSubjectChange(
              event.target.value,
            )
          }
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          {subjects.map(
            (subject) => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.name}
                {subject.code
                  ? ` (${subject.code})`
                  : ""}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">
            Mock Exam Title
          </Label>

          <Input
            id="title"
            value={title}
            maxLength={150}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
            placeholder="e.g. Biology Practice Exam 01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">
            Duration (minutes)
          </Label>

          <Input
            id="duration"
            type="number"
            min={1}
            max={360}
            value={duration}
            onChange={(event) =>
              setDuration(
                Math.max(
                  1,
                  Number(
                    event.target.value,
                  ) || 1,
                ),
              )
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">
          Instructions
        </Label>

        <textarea
          id="instructions"
          value={instructions}
          maxLength={2000}
          onChange={(event) =>
            setInstructions(
              event.target.value,
            )
          }
          placeholder="e.g. Answer all questions. Show your working where applicable."
          rows={4}
          className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Label>
              Select Questions
            </Label>

            <p className="mt-1 text-xs text-muted-foreground">
              Choose generated questions
              to include in this mock exam.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedQuestionIds.length}{" "}
            selected · {totalMarks}{" "}
            {totalMarks === 1
              ? "mark"
              : "marks"}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="question-type-filter">
              Type
            </Label>

            <select
              id="question-type-filter"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="ALL">All types</option>
              <option value="MCQ">MCQ</option>
              <option value="STRUCTURED">Structured</option>
              <option value="ESSAY">Essay</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-difficulty-filter">
              Difficulty
            </Label>

            <select
              id="question-difficulty-filter"
              value={difficultyFilter}
              onChange={(event) =>
                setDifficultyFilter(event.target.value)
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="ALL">All difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-topic-filter">
              Topic
            </Label>

            <select
              id="question-topic-filter"
              value={topicFilter}
              onChange={(event) =>
                setTopicFilter(event.target.value)
              }
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="ALL">All topics</option>
              {subjectTopics.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {subjectQuestions.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            No generated questions are
            available for this subject.
            Generate some questions first.
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            No questions match the selected filters.
          </div>
        ) : (
          <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
            {filteredQuestions.map(
              (question) => {
                const checked =
                  selectedQuestionIds.includes(
                    question.id,
                  );

                return (
                  <label
                    key={question.id}
                    className="flex cursor-pointer items-start gap-3 rounded-md border p-4"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleQuestion(
                          question.id,
                        )
                      }
                      className="mt-1"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-6">
                        {
                          question.questionText
                        }
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border px-2 py-1">
                          {question.type}
                        </span>

                        <span className="rounded-full border px-2 py-1">
                          {
                            question.difficulty
                          }
                        </span>

                        <span className="rounded-full border px-2 py-1">
                          {question.marks ??
                            0}{" "}
                          {(question.marks ??
                            0) === 1
                            ? "mark"
                            : "marks"}
                        </span>
                      </div>
                    </div>
                  </label>
                );
              },
            )}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="text-sm text-muted-foreground">
          {success}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={
          isCreating ||
          subjectQuestions.length === 0
        }
      >
        {isCreating ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <FilePlus2 className="size-4" />
            Create Mock Exam
          </>
        )}
      </Button>
    </form>
  );
}