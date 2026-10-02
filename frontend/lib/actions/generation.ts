"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  generateQuestionsFromChunksWithFastApi,
  type RagChunkingResult,
  type RagDifficulty,
  type RagGeneratedQuestion,
  type RagGenerationResult,
  type RagMode,
} from "@/lib/api/fastapi";

type GenerateQuestionsInput = {
  subjectId: string;
  documentIds: string[];
  topic: string;
  mode: RagMode;
  difficulty: RagDifficulty;
  count: number;
};

function mapQuestionType(mode: RagMode) {
  switch (mode) {
    case "mcq":
      return "MCQ" as const;

    case "structured":
      return "STRUCTURED" as const;

    case "essay":
      return "ESSAY" as const;
  }
}

function mapDifficulty(difficulty: RagDifficulty) {
  switch (difficulty) {
    case "easy":
      return "EASY" as const;

    case "medium":
      return "MEDIUM" as const;

    case "hard":
      return "HARD" as const;
  }
}

function getQuestionMarks(mode: RagMode, question: RagGeneratedQuestion) {
  if (mode === "structured") {
    return Math.round("total_marks" in question ? question.total_marks : 0);
  }

  return Math.round("marks" in question ? question.marks : 0);
}

function getAnswerText(mode: RagMode, question: RagGeneratedQuestion) {
  if (mode === "essay") {
    return "model_answer" in question ? question.model_answer : "";
  }

  return "answer_text" in question ? question.answer_text : "";
}

function getMarksGuidance(mode: RagMode, question: RagGeneratedQuestion) {
  if (mode === "structured" || mode === "essay") {
    return "marks_guidance" in question ? question.marks_guidance : null;
  }

  return null;
}

function getQuestionData(mode: RagMode, question: RagGeneratedQuestion) {
  if (mode === "mcq") {
    return {
      options: "options" in question ? question.options : [],
      correctOption:
        "correct_option" in question ? question.correct_option : null,
    };
  }

  if (mode === "structured") {
    return {
      parts: "parts" in question ? question.parts : [],
    };
  }

  return {
    outline: "outline" in question ? question.outline : [],
  };
}

export async function generateStudyQuestions(
  input: GenerateQuestionsInput,
): Promise<RagGenerationResult> {
  const user = await requireUser();

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

  const uniqueDocumentIds = [...new Set(input.documentIds)];

  if (uniqueDocumentIds.length === 0 || uniqueDocumentIds.length > 3) {
    throw new Error("Select between one and three source documents.");
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
    throw new Error("One or more selected documents are invalid.");
  }

  const processedDocuments: RagChunkingResult[] = documents.map((document) => {
    if (
      document.processingStatus !== "COMPLETED" ||
      !document.processedChunks
    ) {
      throw new Error(`${document.fileName} has not been fully processed yet.`);
    }

    return document.processedChunks as RagChunkingResult;
  });

  const result = await generateQuestionsFromChunksWithFastApi({
    documents: processedDocuments,
    topic: input.topic.trim(),
    mode: input.mode,
    difficulty: input.difficulty,
    subjectName: subject.name,
    count: input.count,
  });

  if (result.questions.length === 0) {
    return result;
  }

  const evidenceById = new Map(
    result.retrieved_evidence.map((evidence) => [
      evidence.evidence_id,
      evidence,
    ]),
  );

  await prisma.$transaction(async (tx) => {
    for (const question of result.questions) {
      const sourceEvidence = question.source_evidence_ids
        .map((id) => evidenceById.get(id))
        .filter(Boolean)
        .map((evidence) => ({
          evidenceId: evidence!.evidence_id,
          filename: evidence!.filename,
          text: evidence!.text,
          relevanceScore: evidence!.relevance_score,
          sourceReferences: evidence!.source_references,
        }));

      const createdQuestion = await tx.generatedQuestion.create({
        data: {
          questionText: question.question_text,

          type: mapQuestionType(input.mode),

          difficulty: mapDifficulty(input.difficulty),

          marks: getQuestionMarks(input.mode, question),

          explanation: question.explanation,

          keyPoints: JSON.stringify(question.key_points),

          sourceEvidence: JSON.stringify(sourceEvidence),

          questionData: getQuestionData(input.mode, question),

          userId: user.id,
          subjectId: subject.id,

          answer: {
            create: {
              answerText: getAnswerText(input.mode, question),

              explanation: question.explanation,

              keyPoints: JSON.stringify(question.key_points),

              marksGuidance: getMarksGuidance(input.mode, question),
            },
          },
        },
      });

      void createdQuestion;
    }
  });

  revalidatePath("/generate");

  return result;
}
