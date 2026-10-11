import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

import { StudyAssistantChat } from "@/components/study-assistant/study-assistant-chat";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function StudyAssistantPage() {
  const user = await requireUser();

  const [subjects, documents] = await Promise.all([
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
        processingStatus: "COMPLETED",

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
          Study Assistant
        </h1>

        <p className="mt-2 text-muted-foreground">
          Ask questions about your uploaded study materials and receive
          evidence-backed answers.
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
                Create a subject and process study materials before using the
                Study Assistant.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Ask your study materials
            </CardTitle>

            <CardDescription>
              Select up to three processed documents. Answers are grounded only
              in the selected source material.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <StudyAssistantChat
              subjects={subjects}
              documents={documents}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}