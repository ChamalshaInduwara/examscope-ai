import { BookOpen } from "lucide-react";
import Link from "next/link";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { CreateSubjectForm } from "@/components/subjects/create-subject-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SubjectsPage() {
  const user = await requireUser();

  const subjects = await prisma.subject.findMany({
    where: {
      userId: user.id,
      archived: false,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>

        <p className="mt-2 text-muted-foreground">
          Create and manage the subjects you want to study with ExamScope AI.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Subject</CardTitle>

          <CardDescription>
            Add a subject or module before uploading study materials.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CreateSubjectForm />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold">My Subjects</h2>

        {subjects.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex min-h-48 items-center justify-center">
              <div className="text-center">
                <BookOpen className="mx-auto size-10 text-muted-foreground" />

                <p className="mt-4 font-medium">No subjects yet</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first subject using the form above.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle>{subject.name}</CardTitle>

                    <CardDescription>
                      {subject.code || "No subject code"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2 text-sm">
                    {subject.educationLevel ? (
                      <p>
                        <span className="font-medium">Level:</span>{" "}
                        {subject.educationLevel}
                      </p>
                    ) : null}

                    {subject.institution ? (
                      <p>
                        <span className="font-medium">Institution:</span>{" "}
                        {subject.institution}
                      </p>
                    ) : null}

                    {subject.examType ? (
                      <p>
                        <span className="font-medium">Exam:</span>{" "}
                        {subject.examType}
                      </p>
                    ) : null}

                    {subject.description ? (
                      <p className="pt-2 text-muted-foreground">
                        {subject.description}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
