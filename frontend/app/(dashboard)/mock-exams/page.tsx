import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

import { MockExamBuilder } from "@/components/mock-exams/mock-exam-builder";
import { MockExamCard } from "@/components/mock-exams/mock-exam-card";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function MockExamsPage() {
  const user = await requireUser();

  const [subjects, questions, mockExams] =
    await Promise.all([
      prisma.subject.findMany({
        where: {
          userId: user.id,
          archived: false,
        },

        select: {
          id: true,
          name: true,
          code: true,
        },

        orderBy: {
          name: "asc",
        },
      }),

      prisma.generatedQuestion.findMany({
        where: {
          userId: user.id,

          subject: {
            archived: false,
          },
        },

        select: {
          id: true,
          questionText: true,
          type: true,
          difficulty: true,
          marks: true,
          subjectId: true,
          topic: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.mockExam.findMany({
        where: {
          userId: user.id,
        },

        include: {
          subject: {
            select: {
              name: true,
              code: true,
            },
          },

          _count: {
            select: {
              questions: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Mock Exams
        </h1>

        <p className="mt-2 text-muted-foreground">
          Build custom mock examination papers from your generated questions.
        </p>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-56 items-center justify-center">
            <div className="text-center">
              <p className="font-medium">
                No subjects available
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Create a subject before building a mock exam.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Create Mock Exam
            </CardTitle>

            <CardDescription>
              Choose a subject and select generated questions to create a draft exam.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <MockExamBuilder
              subjects={subjects}
              questions={questions}
            />
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold">
          My Mock Exams
        </h2>

        {mockExams.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex min-h-40 items-center justify-center">
              <div className="text-center">
                <p className="font-medium">
                  No mock exams yet
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first mock exam using the builder above.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mockExams.map((exam) => (
              <MockExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}