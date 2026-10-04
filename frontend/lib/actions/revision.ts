"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function saveQuestionForRevision(
  generatedQuestionId: string,
) {
  const user = await requireUser();

  const question =
    await prisma.generatedQuestion.findFirst({
      where: {
        id: generatedQuestionId,
        userId: user.id,
      },

      select: {
        id: true,
        subjectId: true,
      },
    });

  if (!question) {
    throw new Error(
      "Generated question not found.",
    );
  }

  const existing =
    await prisma.revisionItem.findFirst({
      where: {
        userId: user.id,
        generatedQuestionId:
          question.id,
      },

      select: {
        id: true,
      },
    });

  if (existing) {
    return {
      success: true,
      alreadySaved: true,
      message:
        "Question is already saved for revision.",
    };
  }

  await prisma.revisionItem.create({
    data: {
      userId: user.id,
      subjectId:
        question.subjectId,
      generatedQuestionId:
        question.id,
    },
  });

  revalidatePath("/revision");

  return {
    success: true,
    alreadySaved: false,
    message:
      "Question saved for revision.",
  };
}

export async function removeRevisionItem(
  revisionItemId: string,
) {
  const user = await requireUser();

  const item =
    await prisma.revisionItem.findFirst({
      where: {
        id: revisionItemId,
        userId: user.id,
      },

      select: {
        id: true,
      },
    });

  if (!item) {
    throw new Error(
      "Revision item not found.",
    );
  }

  await prisma.revisionItem.delete({
    where: {
      id: item.id,
    },
  });

  revalidatePath("/revision");

  return {
    success: true,
  };
}

export async function toggleRevisionImportant(
  revisionItemId: string,
) {
  const user = await requireUser();

  const item =
    await prisma.revisionItem.findFirst({
      where: {
        id: revisionItemId,
        userId: user.id,
      },

      select: {
        id: true,
        important: true,
      },
    });

  if (!item) {
    throw new Error(
      "Revision item not found.",
    );
  }

  const updated =
    await prisma.revisionItem.update({
      where: {
        id: item.id,
      },

      data: {
        important:
          !item.important,
      },

      select: {
        important: true,
      },
    });

  revalidatePath("/revision");

  return {
    success: true,
    important:
      updated.important,
  };
}

export async function updateRevisionNote(
  revisionItemId: string,
  note: string,
) {
  const user = await requireUser();

  const item =
    await prisma.revisionItem.findFirst({
      where: {
        id: revisionItemId,
        userId: user.id,
      },

      select: {
        id: true,
      },
    });

  if (!item) {
    throw new Error(
      "Revision item not found.",
    );
  }

  await prisma.revisionItem.update({
    where: {
      id: item.id,
    },

    data: {
      note:
        note.trim() || null,
    },
  });

  revalidatePath("/revision");

  return {
    success: true,
  };
}