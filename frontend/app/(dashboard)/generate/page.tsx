import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

import { QuestionGeneratorForm } from "@/components/generation/question-generator-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function GeneratePage() {
  const user = await requireUser();

  const [subjects, documents] =
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

      prisma.document.findMany({
        where: {
          subject: {
            userId: user.id,
            archived: false,
          },
        },

        select: {
          id: true,
          title: true,
          fileName: true,
          subjectId: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Question Generator
        </h1>

        <p className="mt-2 text-muted-foreground">
          Generate evidence-backed MCQ, structured and essay questions from
          your uploaded study materials.
        </p>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-56 items-center justify-center">
            <div className="max-w-md text-center">
              <h2 className="font-semibold">
                No subjects available
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Create a subject and upload study materials before generating
                practice questions.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Generate Practice Questions
            </CardTitle>

            <CardDescription>
              Choose source documents, a topic, question type and difficulty.
              Generated questions are grounded in the selected documents.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <QuestionGeneratorForm
              subjects={subjects}
              documents={documents}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}