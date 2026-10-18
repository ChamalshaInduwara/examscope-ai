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
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subjects</h1>

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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">My Subjects</h2>
          <span className="rounded-full bg-[#0466c8]/10 px-3 py-1 text-xs font-semibold text-[#0466c8]">
            {subjects.length} {subjects.length === 1 ? "Subject" : "Subjects"}
          </span>
        </div>

        {subjects.length === 0 ? (
          <Card className="mt-4 border-dashed">
            <CardContent className="flex min-h-48 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#0466c8]/10 text-[#0466c8]">
                  <BookOpen className="size-6" />
                </div>

                <p className="mt-4 text-base font-semibold">No subjects yet</p>

                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Create your first subject using the form above to start uploading syllabus documents and exam papers.
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
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0466c8]"
              >
                <Card className="h-full border border-border/80 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-[#0466c8]/50 group-hover:shadow-[0_12px_28px_-8px_rgba(4,102,200,0.2)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-bold group-hover:text-[#0466c8] transition-colors">
                        {subject.name}
                      </CardTitle>
                      {subject.code && (
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          {subject.code}
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-sm">
                    <div className="flex flex-wrap gap-1.5">
                      {subject.educationLevel && (
                        <span className="rounded-md bg-[#0466c8]/10 px-2 py-0.5 text-xs font-medium text-[#0466c8]">
                          {subject.educationLevel}
                        </span>
                      )}

                      {subject.examType && (
                        <span className="rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {subject.examType}
                        </span>
                      )}

                      {subject.institution && (
                        <span className="rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground truncate max-w-[180px]">
                          {subject.institution}
                        </span>
                      )}
                    </div>

                    {subject.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {subject.description}
                      </p>
                    )}
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
