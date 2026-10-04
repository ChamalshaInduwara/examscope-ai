import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { RevisionCard } from "@/components/revision/revision-card";

export default async function RevisionPage() {
  const user = await requireUser();

  const revisionItems =
    await prisma.revisionItem.findMany({
      where: {
        userId: user.id,
      },

      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },

        generatedQuestion: {
          include: {
            answer: true,
          },
        },
      },

      orderBy: [
        {
          important: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Saved Revision
        </h1>

        <p className="mt-2 text-muted-foreground">
          Review generated questions you saved for later study.
        </p>
      </div>

      {revisionItems.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-56 items-center justify-center">
            <div className="text-center">
              <p className="font-medium">
                No saved revision questions
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Save questions from the Question Generator to review them here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {revisionItems.map((item) => (
            <RevisionCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}