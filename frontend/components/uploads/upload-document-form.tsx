"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";

import {
  completeDocumentUpload,
  prepareDocumentUpload,
  type UploadDocumentState,
} from "@/lib/actions/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SubjectOption = {
  id: string;
  name: string;
  code: string | null;
};

type UploadDocumentFormProps = {
  subjects: SubjectOption[];
  defaultSubjectId?: string;
};

export function UploadDocumentForm({
  subjects,
  defaultSubjectId,
}: UploadDocumentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<UploadDocumentState>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const fileValue = formData.get("file");

    if (!(fileValue instanceof File) || fileValue.size === 0) {
      setState({
        success: false,
        message: "Please select a valid file.",
        errors: {
          file: ["Please select a file."],
        },
      });

      return;
    }

    const file = fileValue;

    setIsPending(true);
    setState({});

    try {
      const subjectId = String(
        formData.get("subjectId") ?? "",
      );

      const prepared = await prepareDocumentUpload({
        subjectId,
        fileName: file.name,
        fileSize: file.size,
        mimeType:
          file.type || "application/octet-stream",
      });

      if (!prepared.success) {
        setState({
          success: false,
          message: prepared.message,
        });

        return;
      }

      const uploadResponse = await fetch(
        prepared.uploadUrl,
        {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type":
              file.type || "application/octet-stream",
          },
        },
      );

      if (!uploadResponse.ok) {
        throw new Error(
          `File upload failed with status ${uploadResponse.status}.`,
        );
      }

      const completed = await completeDocumentUpload({
        subjectId,

        title: String(
          formData.get("title") ?? "",
        ),

        documentType: String(
          formData.get("documentType") ?? "",
        ),

        year:
          String(formData.get("year") ?? "") ||
          undefined,

        description:
          String(formData.get("description") ?? "") ||
          undefined,

        fileName: file.name,
        fileSize: file.size,

        mimeType:
          file.type || "application/octet-stream",

        storageKey: prepared.storageKey,
      });

      setState(completed);

      if (completed.success) {
        formRef.current?.reset();
      }
    } catch (error) {
      console.error("Document upload failed:", error);

      setState({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload the document.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subjectId">Subject</Label>

          <select
            id="subjectId"
            name="subjectId"
            defaultValue={defaultSubjectId ?? ""}
            required
            aria-invalid={Boolean(state.errors?.subjectId)}
            aria-describedby={
              state.errors?.subjectId ? "subjectId-error" : undefined
            }
            className="flex h-9 w-full rounded-lg border border-input bg-background/50 px-3 py-1.5 text-sm transition-all duration-200 outline-none hover:border-slate-400 focus-visible:border-[#0466c8] focus-visible:ring-3 focus-visible:ring-[#0466c8]/25"
          >
            <option value="">Select a subject</option>

            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
                {subject.code ? ` (${subject.code})` : ""}
              </option>
            ))}
          </select>

          {state.errors?.subjectId ? (
            <p id="subjectId-error" className="text-sm text-destructive">
              {state.errors.subjectId[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentType">Document type</Label>

          <select
            id="documentType"
            name="documentType"
            defaultValue=""
            required
            aria-invalid={Boolean(state.errors?.documentType)}
            aria-describedby={
              state.errors?.documentType ? "documentType-error" : undefined
            }
            className="flex h-9 w-full rounded-lg border border-input bg-background/50 px-3 py-1.5 text-sm transition-all duration-200 outline-none hover:border-slate-400 focus-visible:border-[#0466c8] focus-visible:ring-3 focus-visible:ring-[#0466c8]/25"
          >
            <option value="">Select document type</option>

            <option value="PAST_PAPER">Past Paper</option>

            <option value="LECTURE_NOTE">Lecture Note</option>

            <option value="MODULE_CONTENT">Module Content</option>

            <option value="TEXTBOOK">Textbook</option>

            <option value="OTHER">Other</option>
          </select>

          {state.errors?.documentType ? (
            <p id="documentType-error" className="text-sm text-destructive">
              {state.errors.documentType[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Document title</Label>

          <Input
            id="title"
            name="title"
            placeholder="e.g. Biology Past Paper 2025"
            required
            aria-invalid={Boolean(state.errors?.title)}
            aria-describedby={
              state.errors?.title ? "title-error" : undefined
            }
          />

          {state.errors?.title ? (
            <p id="title-error" className="text-sm text-destructive">
              {state.errors.title[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>

          <Input
            id="year"
            name="year"
            type="number"
            min="1900"
            max="2100"
            placeholder="e.g. 2025"
            aria-invalid={Boolean(state.errors?.year)}
            aria-describedby={
              state.errors?.year ? "year-error" : undefined
            }
          />

          {state.errors?.year ? (
            <p id="year-error" className="text-sm text-destructive">
              {state.errors.year[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">File</Label>

          <Input
            id="file"
            name="file"
            type="file"
            accept=".pdf,.docx,.pptx,.txt"
            required
            aria-invalid={Boolean(state.errors?.file)}
            aria-describedby={
              state.errors?.file ? "file-error" : undefined
            }
          />

          <p className="text-xs text-muted-foreground">
            PDF, DOCX, PPTX or TXT. Maximum 20 MB.
          </p>

          {state.errors?.file ? (
            <p id="file-error" className="text-sm text-destructive">
              {state.errors.file[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>

          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Optional notes about this document..."
            aria-invalid={Boolean(state.errors?.description)}
            aria-describedby={
              state.errors?.description ? "description-error" : undefined
            }
            className="flex w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all duration-200 outline-none placeholder:text-muted-foreground hover:border-slate-400 focus-visible:border-[#0466c8] focus-visible:ring-3 focus-visible:ring-[#0466c8]/25"
          />

          {state.errors?.description ? (
            <p id="description-error" className="text-sm text-destructive">
              {state.errors.description[0]}
            </p>
          ) : null}
        </div>
      </div>

      {state.message ? (
        <div
          role="status"
          className={
            state.success
              ? "rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm"
              : "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
          {state.message}
        </div>
      ) : null}

      <Button type="submit" disabled={isPending || subjects.length === 0}>
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <FileUp className="size-4" />
            Upload Document
          </>
        )}
      </Button>
    </form>
  );
}
