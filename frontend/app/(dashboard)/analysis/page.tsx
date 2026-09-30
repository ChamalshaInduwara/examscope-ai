import { BookOpen, FileText, HelpCircle, Layers3 } from "lucide-react";

import { AnalysisSubjectFilter } from "@/components/analysis/analysis-subject-filter";
import { DocumentStatusBadge } from "@/components/uploads/document-status-badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type AnalysisPageProps = {
  searchParams: Promise<{
    subject?: string;
  }>;
};

function formatQuestionType(type: string) {
  const labels: Record<string, string> = {
    MCQ: "MCQ",
    STRUCTURED: "Structured",
    ESSAY: "Essay",
  };

  return labels[type] ?? type;
}

export default async function AnalysisPage({
  searchParams,
}: AnalysisPageProps) {
  const user = await requireUser();

  const { subject: requestedSubjectId } = await searchParams;

  const subjects = await prisma.subject.findMany({
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
  });

  const selectedSubjectId = subjects.some(
    (subject) => subject.id === requestedSubjectId,
  )
    ? requestedSubjectId
    : undefined;

  const subjectFilter = selectedSubjectId
    ? {
        subjectId: selectedSubjectId,
      }
    : {};

  const [documents, topics, questions] = await Promise.all([
    prisma.document.findMany({
      where: {
        ...subjectFilter,

        subject: {
          userId: user.id,
          archived: false,
        },
      },

      select: {
        id: true,
        title: true,
        documentType: true,
        processingStatus: true,
        createdAt: true,

        _count: {
          select: {
            questions: true,
            topics: true,
          },
        },

        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.topic.findMany({
      where: {
        ...subjectFilter,

        subject: {
          userId: user.id,
          archived: false,
        },
      },

      select: {
        id: true,
        name: true,

        _count: {
          select: {
            documents: true,
            questions: true,
          },
        },
      },

      orderBy: {
        name: "asc",
      },
    }),

    prisma.question.findMany({
      where: {
        ...subjectFilter,

        subject: {
          userId: user.id,
          archived: false,
        },
      },

      select: {
        id: true,
        type: true,
        year: true,
        marks: true,
        topicId: true,
      },
    }),
  ]);

  const analyzedDocumentsCount = documents.filter(
    (document) =>
      document.processingStatus === "COMPLETED" &&
      (document._count.questions > 0 || document._count.topics > 0),
  ).length;

  const mcqCount = questions.filter(
    (question) => question.type === "MCQ",
  ).length;

  const structuredCount = questions.filter(
    (question) => question.type === "STRUCTURED",
  ).length;

  const essayCount = questions.filter(
    (question) => question.type === "ESSAY",
  ).length;

  const sortedTopics = [...topics].sort((a, b) => {
    const aCount = a._count.documents + a._count.questions;

    const bCount = b._count.documents + b._count.questions;

    return bCount - aCount;
  });

  const maxTopicActivity = Math.max(
    ...sortedTopics.map(
      (topic) => topic._count.documents + topic._count.questions,
    ),
    1,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analysis</h1>

        <p className="mt-2 text-muted-foreground">
          Explore processed documents, discovered topics and question patterns.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link
              href={
                selectedSubjectId
                  ? `/analysis/questions?subject=${selectedSubjectId}`
                  : "/analysis/questions"
              }
            />
          }
        >
          View Question History
        </Button>

        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link
              href={
                selectedSubjectId
                  ? `/analysis/patterns?subject=${selectedSubjectId}`
                  : "/analysis/patterns"
              }
            />
          }
        >
          View Pattern Analysis
        </Button>
      </div>

      <AnalysisSubjectFilter
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>

            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{analyzedDocumentsCount}</div>

            <p className="text-xs text-muted-foreground">
              {analyzedDocumentsCount} analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics</CardTitle>

            <Layers3 className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{topics.length}</div>

            <p className="text-xs text-muted-foreground">
              Discovered across documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>

            <HelpCircle className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>

            <p className="text-xs text-muted-foreground">
              Detected from past papers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>

            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {selectedSubjectId ? 1 : subjects.length}
            </div>

            <p className="text-xs text-muted-foreground">
              Included in analysis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Question Types</CardTitle>

            <CardDescription>
              Distribution of detected questions.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No analyzed questions are available yet.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <span className="font-medium">MCQ</span>

                  <Badge variant="secondary">{mcqCount}</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <span className="font-medium">Structured</span>

                  <Badge variant="secondary">{structuredCount}</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <span className="font-medium">Essay</span>

                  <Badge variant="secondary">{essayCount}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Activity</CardTitle>

            <CardDescription>
              Topics ranked by document and question associations.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sortedTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No discovered topics are available yet.
              </p>
            ) : (
              <div className="space-y-5">
                {sortedTopics.slice(0, 10).map((topic) => {
                  const activity =
                    topic._count.documents + topic._count.questions;

                  const percentage = Math.max(
                    4,
                    Math.round((activity / maxTopicActivity) * 100),
                  );

                  return (
                    <div key={topic.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="truncate text-sm font-medium">
                          {topic.name}
                        </span>

                        <span className="shrink-0 text-xs text-muted-foreground">
                          {topic._count.documents} docs
                          {" • "}
                          {topic._count.questions} questions
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Processed Documents</CardTitle>

          <CardDescription>
            Documents contributing to the current analysis.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents are available for this selection.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 10).map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{document.title}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {document.subject.name}
                      {document.subject.code
                        ? ` (${document.subject.code})`
                        : ""}
                      {" • "}
                      {document.documentType
                        .replaceAll("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                    </p>
                  </div>

                  <DocumentStatusBadge status={document.processingStatus} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {questions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Question Summary</CardTitle>

            <CardDescription>
              Overview of the question dataset currently available for later
              prediction analysis.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "MCQ",
                  count: mcqCount,
                },
                {
                  label: "Structured",
                  count: structuredCount,
                },
                {
                  label: "Essay",
                  count: essayCount,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    {formatQuestionType(
                      item.label === "Structured"
                        ? "STRUCTURED"
                        : item.label.toUpperCase(),
                    )}
                  </p>

                  <p className="mt-1 text-2xl font-semibold">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
