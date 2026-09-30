"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { generatePredictionsWithFastApi } from "@/lib/api/fastapi";
import { prisma } from "@/lib/db/prisma";

export async function generatePredictions(
  formData: FormData
) {
  const user = await requireUser();

  const subjectId =
    formData.get("subjectId");

  if (
    typeof subjectId !== "string" ||
    !subjectId
  ) {
    return;
  }

  const subject =
    await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: user.id,
        archived: false,
      },

      select: {
        id: true,
      },
    });

  if (!subject) {
    return;
  }

  const [questions, topics] =
    await Promise.all([
      prisma.question.findMany({
        where: {
          subjectId: subject.id,
        },

        select: {
          id: true,
          text: true,
          year: true,
          type: true,
          marks: true,
          topicId: true,

          topic: {
            select: {
              name: true,
            },
          },
        },
      }),

      prisma.topic.findMany({
        where: {
          subjectId: subject.id,
        },

        select: {
          id: true,
          name: true,

          _count: {
            select: {
              questions: true,
              documents: true,
            },
          },
        },
      }),
    ]);

  if (topics.length === 0) {
    return;
  }

  const result =
    await generatePredictionsWithFastApi({
      questions: questions.map(
        (question) => ({
          id: question.id,
          text: question.text,
          year: question.year,
          question_type:
            question.type,
          marks: question.marks,
          topic_id:
            question.topicId,
          topic_name:
            question.topic?.name ??
            null,
        })
      ),

      topics: topics.map(
        (topic) => ({
          id: topic.id,
          name: topic.name,

          question_count:
            topic._count.questions,

          document_count:
            topic._count.documents,
        })
      ),

      max_predictions: 10,
    });

  const validTopicIds =
    new Set(
      topics.map(
        (topic) => topic.id
      )
    );

  await prisma.$transaction(
    async (tx) => {
      await tx.prediction.deleteMany({
        where: {
          subjectId: subject.id,
        },
      });

      for (
        const prediction
        of result.predictions
      ) {
        const topicId =
          prediction.topic_id &&
          validTopicIds.has(
            prediction.topic_id
          )
            ? prediction.topic_id
            : null;

        await tx.prediction.create({
          data: {
            title:
              prediction.title,

            explanation:
              prediction.explanation,

            score:
              prediction.score,

            rank:
              prediction.rank,

            recurrenceScore:
              prediction.recurrence_score,

            similarityScore:
              prediction.similarity_score,

            recencyScore:
              prediction.recency_score,

            importanceScore:
              prediction.importance_score,

            subjectId:
              subject.id,

            topicId,
          },
        });
      }
    }
  );

  revalidatePath("/predictions");
}