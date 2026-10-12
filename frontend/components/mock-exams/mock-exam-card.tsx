"use client";

import Link from "next/link";
import { useState } from "react";

import { markMockExamReady } from "@/lib/actions/mock-exams";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MockExamCardProps = {
  exam: {
    id: string;
    title: string;
    duration: number;
    totalMarks: number | null;
    status: string;
    instructions: string | null;

    subject: {
      name: string;
      code: string | null;
    };

    _count: {
      questions: number;
    };
  };
};

export function MockExamCard({
  exam,
}: MockExamCardProps) {
  const [isUpdating, setIsUpdating] =
    useState(false);

  async function handleMarkReady() {
    setIsUpdating(true);

    try {
      await markMockExamReady(
        exam.id,
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">
              {exam.title}
            </CardTitle>

            <CardDescription className="mt-1">
              {exam.subject.name}
              {exam.subject.code
                ? ` (${exam.subject.code})`
                : ""}
            </CardDescription>
          </div>

          <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
            {exam.status}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="font-medium">
            Duration:
          </span>{" "}
          {exam.duration} minutes
        </p>

        <p>
          <span className="font-medium">
            Questions:
          </span>{" "}
          {exam._count.questions}
        </p>

        <p>
          <span className="font-medium">
            Total Marks:
          </span>{" "}
          {exam.totalMarks ?? 0}
        </p>

        {exam.instructions ? (
          <p className="pt-2 text-muted-foreground">
            {exam.instructions}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          {exam.status === "DRAFT" ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleMarkReady}
              disabled={isUpdating}
            >
              {isUpdating
                ? "Updating..."
                : "Mark Ready"}
            </Button>
          ) : null}

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/mock-exams/${exam.id}`} />}
          >
            Open Exam
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}