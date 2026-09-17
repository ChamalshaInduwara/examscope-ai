import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { EditSubjectForm } from "@/components/subjects/edit-subject-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EditSubjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSubjectPage({
  params,
}: EditSubjectPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const subject = await prisma.subject.findFirst({
    where: {
      id,
      userId: user.id,
      archived: false,
    },
  });

  if (!subject) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button
        variant="ghost"
        nativeButton={false}
        render={<Link href={`/subjects/${subject.id}`} />}
      >
        <ArrowLeft className="size-4" />
        Back to Subject
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Subject</CardTitle>

          <CardDescription>
            Update the information for {subject.name}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <EditSubjectForm subject={subject} />
        </CardContent>
      </Card>
    </div>
  );
}