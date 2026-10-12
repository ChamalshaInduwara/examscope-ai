"use client";

import { useActionState, useEffect, useRef } from "react";
import { FileUp, Loader2 } from "lucide-react";

import {
  uploadDocument,
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

const initialState: UploadDocumentState = {};

export function UploadDocumentForm({
  subjects,
  defaultSubjectId,
}: UploadDocumentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    uploadDocument,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
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
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
