"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Plus } from "lucide-react";

import {
  createSubject,
  type CreateSubjectState,
} from "@/lib/actions/subjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateSubjectState = {};

export function CreateSubjectForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    createSubject,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Subject name
          </Label>

          <Input
            id="name"
            name="name"
            placeholder="e.g. Biology"
            required
          />

          {state.errors?.name ? (
            <p className="text-sm text-destructive">
              {state.errors.name[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">
            Subject code
          </Label>

          <Input
            id="code"
            name="code"
            placeholder="e.g. BIO-101"
          />

          {state.errors?.code ? (
            <p className="text-sm text-destructive">
              {state.errors.code[0]}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="educationLevel">
            Education level
          </Label>

          <Input
            id="educationLevel"
            name="educationLevel"
            placeholder="e.g. A/L, Undergraduate"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">
            Institution
          </Label>

          <Input
            id="institution"
            name="institution"
            placeholder="e.g. IIT Sri Lanka"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="examType">
            Exam type
          </Label>

          <Input
            id="examType"
            name="examType"
            placeholder="e.g. Final Examination"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">
            Description
          </Label>

          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Add a short description about this subject..."
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </div>

      {state.message ? (
        <div
          className={
            state.success
              ? "rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm"
              : "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          }
        >
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
            Creating...
          </>
        ) : (
          <>
            <Plus className="size-4" />
            Create Subject
          </>
        )}
      </Button>
    </form>
  );
}