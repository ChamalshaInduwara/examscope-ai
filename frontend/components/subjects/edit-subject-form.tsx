"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  updateSubject,
  type UpdateSubjectState,
} from "@/lib/actions/subjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditSubjectFormProps = {
  subject: {
    id: string;
    name: string;
    code: string | null;
    educationLevel: string | null;
    institution: string | null;
    examType: string | null;
    description: string | null;
  };
};

const initialState: UpdateSubjectState = {};

export function EditSubjectForm({
  subject,
}: EditSubjectFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateSubject,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <input
        type="hidden"
        name="subjectId"
        value={subject.id}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Subject name</Label>

          <Input
            id="name"
            name="name"
            defaultValue={subject.name}
            required
          />

          {state.errors?.name ? (
            <p className="text-sm text-destructive">
              {state.errors.name[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Subject code</Label>

          <Input
            id="code"
            name="code"
            defaultValue={subject.code ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="educationLevel">
            Education level
          </Label>

          <Input
            id="educationLevel"
            name="educationLevel"
            defaultValue={subject.educationLevel ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">
            Institution
          </Label>

          <Input
            id="institution"
            name="institution"
            defaultValue={subject.institution ?? ""}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="examType">
            Exam type
          </Label>

          <Input
            id="examType"
            name="examType"
            defaultValue={subject.examType ?? ""}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">
            Description
          </Label>

          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={subject.description ?? ""}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>

      {state.message ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="size-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  );
}