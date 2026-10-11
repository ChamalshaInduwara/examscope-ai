"use server";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  answerStudyQuestionFromChunksWithFastApi,
  type RagChunkingResult,
  type StudyAssistantResult,
} from "@/lib/api/fastapi";

type AskStudyAssistantInput = {
  subjectId: string;
  documentIds: string[];
  question: string;
};

export async function askStudyAssistant(
  input: AskStudyAssistantInput,
): Promise<StudyAssistantResult> {
  const user = await requireUser();
  const question = input.question.trim();

  if (!question) {
    throw new Error("Question is required.");
  }

  if (question.length > 1000) {
    throw new Error(
      "Question must not exceed 1000 characters.",
    );
  }

  const subject = await prisma.subject.findFirst({
    where: {
      id: input.subjectId,
      userId: user.id,
      archived: false,
    },

    select: {
      id: true,
      name: true,
    },
  });

  if (!subject) {
    throw new Error("Subject not found.");
  }

  const uniqueDocumentIds = [
    ...new Set(input.documentIds),
  ];

  if (
    uniqueDocumentIds.length === 0 ||
    uniqueDocumentIds.length > 3
  ) {
    throw new Error(
      "Select between one and three source documents.",
    );
  }

  const documents = await prisma.document.findMany({
    where: {
      id: {
        in: uniqueDocumentIds,
      },

      subjectId: subject.id,
    },

    select: {
      id: true,
      fileName: true,
      processingStatus: true,
      processedChunks: true,
    },
  });

  if (documents.length !== uniqueDocumentIds.length) {
    throw new Error(
      "One or more selected documents are invalid.",
    );
  }

  const processedDocuments: RagChunkingResult[] =
    documents.map((document) => {
      if (
        document.processingStatus !== "COMPLETED" ||
        !document.processedChunks
      ) {
        throw new Error(
          `${document.fileName} has not been fully processed yet.`,
        );
      }

      return document.processedChunks as RagChunkingResult;
    });

  return answerStudyQuestionFromChunksWithFastApi({
    documents: processedDocuments,
    question,
    subjectName: subject.name,
  });
}