import { Download, Eye, FileText, FileUp, Play, Trash2 } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

import { UploadDocumentForm } from "@/components/uploads/upload-document-form";
import { DocumentStatusBadge } from "@/components/uploads/document-status-badge";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Link from "next/link";

import { deleteDocument, processDocument } from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";

type UploadsPageProps = {
  searchParams: Promise<{
    subject?: string;
  }>;
};

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return "Unknown size";
  }

  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }

  return `${(bytes / 1024).toFixed(0)} KB`;
}

function formatDocumentType(type: string) {
  const labels: Record<string, string> = {
    PAST_PAPER: "Past Paper",
    LECTURE_NOTE: "Lecture Note",
    MODULE_CONTENT: "Module Content",
    TEXTBOOK: "Textbook",
    OTHER: "Other",
  };

  return labels[type] ?? type;
}

export default async function UploadsPage({ searchParams }: UploadsPageProps) {
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

  const defaultSubjectId = subjects.some(
    (subject) => subject.id === requestedSubjectId,
  )
    ? requestedSubjectId
    : undefined;

  const documents = await prisma.document.findMany({
    where: {
      subject: {
        userId: user.id,
        archived: false,
      },

      ...(defaultSubjectId
        ? {
            subjectId: defaultSubjectId,
          }
        : {}),
    },

    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Upload Center</h1>

        <p className="mt-2 text-muted-foreground">
          Upload past papers, lecture notes and other study materials for
          analysis.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="size-5" />
            Upload Document
          </CardTitle>

          <CardDescription>
            Select a subject, add document details and choose a supported file.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {subjects.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">
                Create a subject before uploading documents.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Every uploaded document must belong to one of your subjects.
              </p>
            </div>
          ) : (
            <UploadDocumentForm
              subjects={subjects}
              defaultSubjectId={defaultSubjectId}
            />
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">My Documents</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Track uploaded files and their processing status.
          </p>
        </div>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-48 items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto size-10 text-muted-foreground" />

                <p className="mt-4 font-medium">No documents uploaded</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Upload your first study document above.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <Card key={document.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="size-5 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">{document.title}</p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {document.subject.name}
                        {document.subject.code
                          ? ` (${document.subject.code})`
                          : ""}
                        {" • "}
                        {formatDocumentType(document.documentType)}

                        {document.year ? ` • ${document.year}` : ""}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {document.fileType.toUpperCase()}
                        {" • "}
                        {formatFileSize(document.fileSize)}
                        {" • "}
                        Uploaded{" "}
                        {document.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>

                      {document.processingStatus === "FAILED" &&
                      document.processingError ? (
                        <p className="mt-2 text-sm text-destructive">
                          {document.processingError}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
                    <DocumentStatusBadge status={document.processingStatus} />

                    {document.processingStatus !== "PROCESSING" ? (
                      <form action={processDocument}>
                        <input
                          type="hidden"
                          name="documentId"
                          value={document.id}
                        />

                        <Button type="submit" size="sm">
                          <Play className="size-4" />
                          {document.processingStatus === "FAILED"
                            ? "Retry"
                            : document.processingStatus === "COMPLETED"
                              ? "Reprocess"
                              : "Process"}
                        </Button>
                      </form>
                    ) : null}

                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/api/documents/${document.id}/file?mode=view`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <Eye className="size-4" />
                      View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/api/documents/${document.id}/file?mode=download`}
                        />
                      }
                    >
                      <Download className="size-4" />
                      Download
                    </Button>

                    <form action={deleteDocument}>
                      <input
                        type="hidden"
                        name="documentId"
                        value={document.id}
                      />

                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
