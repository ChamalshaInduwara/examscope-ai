"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Clock3, Play } from "lucide-react";

import {
  startMockExamAttempt,
  submitMockExamAttempt,
} from "@/lib/actions/mock-exams";
import { Button } from "@/components/ui/button";

type MCQOption = {
  label: string;
  text: string;
};

type StructuredPart = {
  label: string;
  question_text: string;
  marks: number;
};

type MockExamQuestion = {
  id: string;
  position: number;
  marks: number | null;
  generatedQuestion: {
    id: string;
    questionText: string;
    type: string;
    difficulty: string;
    marks: number | null;
    questionData: unknown;
  };
};

type MockExamAttemptProps = {
  mockExamId: string;
  duration: number;
  questions: MockExamQuestion[];
};

type Answers = Record<string, string | Record<string, string>>;

function getQuestionData(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export function MockExamAttempt({
  mockExamId,
  duration,
  questions,
}: MockExamAttemptProps) {
  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [answers, setAnswers] = useState<Answers>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const autoSubmitStartedRef = useRef(false);
  const timeExpired =
    started && secondsLeft === 0;

  useEffect(() => {
    if (!started || secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, secondsLeft]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }, [secondsLeft]);

  function setTextAnswer(questionId: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  }

  function setStructuredAnswer(
    questionId: string,
    partLabel: string,
    value: string,
  ) {
    setAnswers((current) => {
      const existing = current[questionId];
      const parts =
        existing && typeof existing === "object" ? existing : {};

      return {
        ...current,
        [questionId]: {
          ...parts,
          [partLabel]: value,
        },
      };
    });
  }

  async function handleStartExam() {
    setIsStarting(true);
    setStartError(null);

    try {
      const result = await startMockExamAttempt(mockExamId);

      setAttemptId(result.attemptId);

      const startedAt = new Date(result.startedAt).getTime();
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const remainingSeconds = Math.max(
        0,
        duration * 60 - elapsedSeconds,
      );

      setSecondsLeft(remainingSeconds);
      setStarted(true);
    } catch (error) {
      setStartError(
        error instanceof Error
          ? error.message
          : "Unable to start mock exam.",
      );
    } finally {
      setIsStarting(false);
    }
  }

  const submitExam = useCallback(
    async (showConfirmation: boolean) => {
      if (
        !attemptId ||
        submitted ||
        isSubmitting
      ) {
        return;
      }

      if (
        showConfirmation &&
        !window.confirm(
          "Submit this mock exam now?",
        )
      ) {
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await submitMockExamAttempt({
          attemptId,
          answers: questions.map(
            (examQuestion) => ({
              generatedQuestionId:
                examQuestion.generatedQuestion.id,

              answerData:
                answers[
                  examQuestion.generatedQuestion.id
                ] ?? "",
            }),
          ),
        });

        setSubmitted(true);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Unable to submit mock exam.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      answers,
      attemptId,
      isSubmitting,
      questions,
      submitted,
    ],
  );

  async function handleSubmitExam() {
    await submitExam(true);
  }

  useEffect(() => {
    if (
      !started ||
      submitted ||
      isSubmitting ||
      !attemptId ||
      secondsLeft !== 5 ||
      autoSubmitStartedRef.current
    ) {
      return;
    }

    autoSubmitStartedRef.current = true;

    void submitExam(false);
  }, [
    attemptId,
    isSubmitting,
    secondsLeft,
    started,
    submitted,
    submitExam,
  ]);

  if (!started) {
    return (
      <div className="space-y-3">
        <Button
          type="button"
          onClick={handleStartExam}
          disabled={isStarting}
        >
          <Play className="size-4" />
          {isStarting ? "Starting..." : "Start Exam"}
        </Button>

        {startError ? (
          <p className="text-sm text-destructive">{startError}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-4 z-10 flex flex-col items-start gap-3 rounded-lg border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">Exam in progress</p>
          <p className="text-xs text-muted-foreground">
            Answer all questions before submitting.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-lg font-semibold">
          <Clock3 className="size-5" />
          {formattedTime}
        </div>
      </div>

      {questions.map((examQuestion) => {
        const question = examQuestion.generatedQuestion;
        const data = getQuestionData(question.questionData);
        const marks = examQuestion.marks ?? question.marks ?? 0;

        if (question.type === "MCQ") {
          const options = Array.isArray(data.options)
            ? (data.options as MCQOption[])
            : [];

          return (
            <div key={examQuestion.id} className="rounded-lg border p-4 sm:p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Question {examQuestion.position}
                </p>
                <span className="text-xs text-muted-foreground">
                  {marks} {marks === 1 ? "mark" : "marks"}
                </span>
              </div>

              <p className="mt-3 break-words font-medium leading-7">
                {question.questionText}
              </p>

              <div className="mt-4 space-y-2">
                {options.map((option) => (
                  <label
                    key={option.label}
                    className="flex cursor-pointer items-start gap-3 rounded-md border p-3"
                  >
                    <input
                      type="radio"
                      className="mt-1 shrink-0"
                      name={question.id}
                      value={option.label}
                      checked={answers[question.id] === option.label}
                      disabled={timeExpired || submitted}
                      onChange={() =>
                        setTextAnswer(question.id, option.label)
                      }
                    />
                    <span className="shrink-0 font-semibold">{option.label}.</span>
                    <span className="min-w-0 break-words">{option.text}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }

        if (question.type === "STRUCTURED") {
          const parts = Array.isArray(data.parts)
            ? (data.parts as StructuredPart[])
            : [];

          return (
            <div key={examQuestion.id} className="rounded-lg border p-4 sm:p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Question {examQuestion.position}
                </p>
                <span className="text-xs text-muted-foreground">
                  {marks} marks
                </span>
              </div>

              <p className="mt-3 break-words font-medium leading-7">
                {question.questionText}
              </p>

              <div className="mt-4 space-y-4">
                {parts.map((part) => (
                  <div key={part.label} className="space-y-2">
                    <p className="break-words text-sm font-medium">
                      {part.label} {part.question_text} ({part.marks} marks)
                    </p>
                    <textarea
                      rows={4}
                      value={
                        (
                          answers[question.id] as
                            | Record<string, string>
                            | undefined
                        )?.[part.label] ?? ""
                      }
                      onChange={(event) =>
                        setStructuredAnswer(
                          question.id,
                          part.label,
                          event.target.value,
                        )
                      }
                      disabled={timeExpired || submitted}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="Enter your answer..."
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={examQuestion.id} className="rounded-lg border p-4 sm:p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Question {examQuestion.position}
              </p>
              <span className="text-xs text-muted-foreground">
                {marks} marks
              </span>
            </div>

            <p className="mt-3 break-words font-medium leading-7">
              {question.questionText}
            </p>

            <textarea
              rows={10}
              value={
                typeof answers[question.id] === "string"
                  ? (answers[question.id] as string)
                  : ""
              }
              onChange={(event) =>
                setTextAnswer(question.id, event.target.value)
              }
              disabled={timeExpired || submitted}
              className="mt-4 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Write your essay answer..."
            />
          </div>
        );
      })}

      <Button
        type="button"
        onClick={handleSubmitExam}
        disabled={
          isSubmitting ||
          submitted ||
          timeExpired
        }
      >
        {isSubmitting
          ? "Submitting..."
          : submitted
            ? "Exam Submitted"
            : "Submit Exam"}
      </Button>

      {submitError ? (
        <p className="text-sm text-destructive">{submitError}</p>
      ) : null}

      {submitted ? (
        <p className="text-sm text-muted-foreground">
          Mock exam submitted successfully.
        </p>
      ) : null}

      {timeExpired ? (
        <p className="text-sm text-destructive">
          Time is up. This mock exam can no longer be edited or submitted.
        </p>
      ) : null}
    </div>
  );
}
