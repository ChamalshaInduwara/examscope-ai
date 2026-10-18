import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  FileQuestion,
} from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

import { MockExamAttempt } from "@/components/mock-exams/mock-exam-attempt";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MockExamPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatTimeSpent(seconds: number | null) {
  if (seconds === null) {
    return "Not available";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}m ${remainingSeconds}s`;
}

function getSafeAttemptQuestionData(
  type: string,
  value: unknown,
) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const data =
    value as Record<string, unknown>;

  if (type === "MCQ") {
    return {
      options: Array.isArray(data.options)
        ? data.options
        : [],
    };
  }

  if (type === "STRUCTURED") {
    const parts =
      Array.isArray(data.parts)
        ? data.parts
        : [];

    return {
      parts: parts.map((part) => {
        if (
          !part ||
          typeof part !== "object" ||
          Array.isArray(part)
        ) {
          return {};
        }

        const safePart =
          part as Record<string, unknown>;

        return {
          label: safePart.label,
          question_text:
            safePart.question_text,
          marks: safePart.marks,
        };
      }),
    };
  }

  return {};
}

export default async function MockExamPage({
  params,
}: MockExamPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const exam = await prisma.mockExam.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      subject: {
        select: {
          name: true,
          code: true,
        },
      },
      questions: {
        orderBy: {
          position: "asc",
        },
        include: {
          generatedQuestion: {
            select: {
              id: true,
              questionText: true,
              type: true,
              difficulty: true,
              marks: true,
              questionData: true,
              answer: {
                select: {
                  answerText: true,
                  explanation: true,
                  keyPoints: true,
                  marksGuidance: true,
                },
              },
            },
          },
        },
      },
      attempts: {
        where: {
          userId: user.id,
          completed: true,
        },
        orderBy: {
          submittedAt: "desc",
        },
        take: 1,
        include: {
          answers: {
            include: {
              mockExamQuestion: {
                select: {
                  id: true,
                  generatedQuestionId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  const latestAttempt = exam.attempts[0] ?? null;
  const submittedAnswers = new Map(
    latestAttempt?.answers.map((answer) => [
      answer.mockExamQuestionId,
      answer,
    ]) ?? [],
  );
  const safeAttemptQuestions =
    exam.questions.map((examQuestion) => ({
      id: examQuestion.id,
      position: examQuestion.position,
      marks: examQuestion.marks,

      generatedQuestion: {
        id:
          examQuestion.generatedQuestion.id,

        questionText:
          examQuestion.generatedQuestion
            .questionText,

        type:
          examQuestion.generatedQuestion.type,

        difficulty:
          examQuestion.generatedQuestion
            .difficulty,

        marks:
          examQuestion.generatedQuestion.marks,

        questionData:
          getSafeAttemptQuestionData(
            examQuestion.generatedQuestion.type,
            examQuestion.generatedQuestion
              .questionData,
          ),
      },
    }));

  return (
    <div className="space-y-8">
      <div>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/mock-exams" />}
          className="mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Mock Exams
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
              {exam.title}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {exam.subject.name}
              {exam.subject.code ? ` (${exam.subject.code})` : ""}
            </p>
          </div>
          <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
            {exam.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{exam.duration}</span>
              <Clock3 className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {exam.questions.length}
              </span>
              <FileQuestion className="size-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {exam.totalMarks ?? 0}
            </span>
          </CardContent>
        </Card>
      </div>

      {exam.instructions ? (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {exam.instructions}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {exam.status !== "READY" ? (
        <div>
          <h2 className="text-xl font-semibold">Questions</h2>
          <div className="mt-4 space-y-4">
            {exam.questions.map((examQuestion) => {
              const question = examQuestion.generatedQuestion;
              const marks = examQuestion.marks ?? question.marks ?? 0;

              return (
                <Card key={examQuestion.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Question {examQuestion.position}
                        </p>
                        <CardTitle className="mt-2 text-lg">
                          {question.questionText}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border px-2 py-1">
                          {question.type}
                        </span>
                        <span className="rounded-full border px-2 py-1">
                          {question.difficulty}
                        </span>
                        <span className="rounded-full border px-2 py-1">
                          {marks} {marks === 1 ? "mark" : "marks"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {exam.status === "COMPLETED" && latestAttempt ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Exam Review</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your submitted answers and the model answers.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attempt Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="mt-1 font-medium">
                  {formatTimeSpent(latestAttempt.timeSpent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="mt-1 font-medium">
                  {latestAttempt.submittedAt
                    ? latestAttempt.submittedAt.toLocaleString()
                    : "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="mt-1 font-medium">Completed</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {exam.questions.map((examQuestion) => {
              const question = examQuestion.generatedQuestion;
              const submitted = submittedAnswers.get(examQuestion.id);
              const answerData = submitted?.answerData;
              const marks = examQuestion.marks ?? question.marks ?? 0;

              return (
                <Card key={examQuestion.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Question {examQuestion.position}
                        </p>
                        <CardTitle className="mt-2 text-lg">
                          {question.questionText}
                        </CardTitle>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full border px-2 py-1">
                          {question.type}
                        </span>
                        <span className="rounded-full border px-2 py-1">
                          {marks} {marks === 1 ? "mark" : "marks"}
                        </span>
                        {submitted?.isCorrect === true ? (
                          <span className="rounded-full border px-2 py-1">
                            Correct
                          </span>
                        ) : null}
                        {submitted?.isCorrect === false ? (
                          <span className="rounded-full border px-2 py-1">
                            Incorrect
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div>
                      <p className="text-sm font-semibold">Your Answer</p>
                      {typeof answerData === "string" ? (
                        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                          {answerData || "No answer submitted."}
                        </p>
                      ) : answerData &&
                        typeof answerData === "object" &&
                        !Array.isArray(answerData) ? (
                        <div className="mt-2 space-y-2">
                          {Object.entries(answerData).map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-md border p-3"
                            >
                              <p className="text-sm font-medium">{label}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {typeof value === "string" ? value : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          No answer submitted.
                        </p>
                      )}
                    </div>

                    {question.answer ? (
                      <div className="rounded-md border bg-muted/30 p-4">
                        <p className="text-sm font-semibold">Model Answer</p>
                        <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                          {question.answer.answerText}
                        </p>

                        {question.answer.explanation ? (
                          <div className="mt-4">
                            <p className="text-sm font-semibold">
                              Explanation
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {question.answer.explanation}
                            </p>
                          </div>
                        ) : null}

                        {question.answer.marksGuidance ? (
                          <div className="mt-4">
                            <p className="text-sm font-semibold">
                              Marks Guidance
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {question.answer.marksGuidance}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {submitted?.awardedMarks !== null &&
                    submitted?.awardedMarks !== undefined ? (
                      <p className="text-sm">
                        <span className="font-semibold">Awarded Marks:</span>{" "}
                        {submitted.awardedMarks} / {marks}
                      </p>
                    ) : question.type !== "MCQ" ? (
                      <p className="text-sm text-muted-foreground">
                        This response is saved for review and has not been
                        automatically graded.
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {exam.status === "READY" ? (
        <MockExamAttempt
          mockExamId={exam.id}
          duration={exam.duration}
          questions={safeAttemptQuestions}
        />
      ) : null}
    </div>
  );
}