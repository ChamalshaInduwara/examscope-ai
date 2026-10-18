import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  FileQuestion,
  FileText,
  Pencil,
  Upload,
} from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { archiveSubject } from "@/lib/actions/subjects";

type SubjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SubjectPage({ params }: SubjectPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const subject = await prisma.subject.findFirst({
    where: {
      id,
      userId: user.id,
      archived: false,
    },

    include: {
      _count: {
        select: {
          documents: true,
          topics: true,
          questions: true,
          predictions: true,
          generatedQuestions: true,
        },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/subjects" />}
          className="mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Subjects
        </Button>

        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-6" />
          </div>

          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
              {subject.name}
            </h1>

            <p className="mt-1 break-words text-muted-foreground">
              {subject.code || "No subject code"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
  <Button
    variant="outline"
    nativeButton={false}
    render={<Link href={`/subjects/${subject.id}/edit`} />}
  >
    <Pencil className="size-4" />
    Edit Subject
  </Button>

  <form action={archiveSubject}>
    <input
      type="hidden"
      name="subjectId"
      value={subject.id}
    />

    <Button
      type="submit"
      variant="destructive"
    >
      <Archive className="size-4" />
      Archive Subject
    </Button>
  </form>
</div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>

          <CardDescription>
            Information about this subject workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Education level</p>

            <p className="mt-1 font-medium">
              {subject.educationLevel || "Not specified"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Institution</p>

            <p className="mt-1 font-medium">
              {subject.institution || "Not specified"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Exam type</p>

            <p className="mt-1 font-medium">
              {subject.examType || "Not specified"}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Created</p>

            <p className="mt-1 font-medium">
              {subject.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {subject.description ? (
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>

              <p className="mt-1">{subject.description}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Documents</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {subject._count.documents}
              </span>

              <FileText className="size-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Topics</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {subject._count.topics}
              </span>

              <BrainCircuit className="size-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Questions</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {subject._count.questions}
              </span>

              <FileQuestion className="size-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Predictions</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {subject._count.predictions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Generated</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {subject._count.generatedQuestions}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Study Workspace</CardTitle>

          <CardDescription>
            Continue preparing this subject with ExamScope AI.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/uploads?subject=${subject.id}`} />}
          >
            <Upload className="size-4" />
            Upload Materials
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/analysis?subject=${subject.id}`} />}
          >
            <FileText className="size-4" />
            Past Paper Analysis
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/generate?subject=${subject.id}`} />}
          >
            <FileQuestion className="size-4" />
            Generate Questions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
