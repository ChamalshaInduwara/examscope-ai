"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type CreateMockExamInput = {
  subjectId: string;
  title: string;
  duration: number;
  instructions?: string;
  generatedQuestionIds: string[];
};

export async function createMockExam(
  input: CreateMockExamInput,
) {
  const user = await requireUser();

  const title = input.title.trim();

  if (!title) {
    throw new Error(
      "Mock exam title is required.",
    );
  }

  if (
    !Number.isInteger(input.duration) ||
    input.duration <= 0
  ) {
    throw new Error(
      "Duration must be greater than zero.",
    );
  }

  const subject =
    await prisma.subject.findFirst({
      where: {
        id: input.subjectId,
        userId: user.id,
        archived: false,
      },

      select: {
        id: true,
      },
    });

  if (!subject) {
    throw new Error(
      "Subject not found.",
    );
  }

  const questionIds = [
    ...new Set(
      input.generatedQuestionIds,
    ),
  ];

  if (questionIds.length === 0) {
    throw new Error(
      "Select at least one generated question.",
    );
  }

  const questions =
    await prisma.generatedQuestion.findMany({
      where: {
        id: {
          in: questionIds,
        },

        userId: user.id,
        subjectId: subject.id,
      },

      select: {
        id: true,
        marks: true,
      },
    });

  if (
    questions.length !==
    questionIds.length
  ) {
    throw new Error(
      "One or more selected questions are invalid.",
    );
  }

  const questionMap =
    new Map(
      questions.map(
        (question) => [
          question.id,
          question,
        ],
      ),
    );

  const totalMarks =
    questionIds.reduce(
      (total, questionId) =>
        total +
        (questionMap.get(
          questionId,
        )?.marks ?? 0),
      0,
    );

  const mockExam =
    await prisma.mockExam.create({
      data: {
        title,
        duration:
          input.duration,

        totalMarks,

        instructions:
          input.instructions?.trim() ||
          null,

        status: "DRAFT",

        userId: user.id,
        subjectId:
          subject.id,

        questions: {
          create:
            questionIds.map(
              (
                questionId,
                index,
              ) => ({
                position:
                  index + 1,

                marks:
                  questionMap.get(
                    questionId,
                  )?.marks ??
                  null,

                generatedQuestionId:
                  questionId,
              }),
            ),
        },
      },

      select: {
        id: true,
      },
    });

  revalidatePath(
    "/mock-exams",
  );

  return {
    success: true,
    mockExamId:
      mockExam.id,
  };
}

export async function markMockExamReady(
  mockExamId: string,
) {
  const user = await requireUser();

  const exam =
    await prisma.mockExam.findFirst({
      where: {
        id: mockExamId,
        userId: user.id,
      },

      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

  if (!exam) {
    throw new Error(
      "Mock exam not found.",
    );
  }

  if (
    exam._count.questions === 0
  ) {
    throw new Error(
      "A mock exam must contain at least one question before it can be marked ready.",
    );
  }

  await prisma.mockExam.update({
    where: {
      id: exam.id,
    },

    data: {
      status: "READY",
    },
  });

  revalidatePath(
    "/mock-exams",
  );

  return {
    success: true,
  };
}

export async function startMockExamAttempt(
  mockExamId: string,
) {
  const user = await requireUser();

  const exam =
    await prisma.mockExam.findFirst({
      where: {
        id: mockExamId,
        userId: user.id,
        status: "READY",
      },

      select: {
        id: true,
      },
    });

  if (!exam) {
    throw new Error(
      "This mock exam is not available to start.",
    );
  }

  const existingAttempt =
    await prisma.mockExamAttempt.findFirst({
      where: {
        mockExamId: exam.id,
        userId: user.id,
        completed: false,
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        startedAt: true,
      },
    });

  if (existingAttempt) {
    return {
      success: true,
      attemptId:
        existingAttempt.id,
      startedAt:
        existingAttempt.startedAt,
      resumed: true,
    };
  }

  const attempt =
    await prisma.mockExamAttempt.create({
      data: {
        mockExamId: exam.id,
        userId: user.id,
      },

      select: {
        id: true,
        startedAt: true,
      },
    });

  return {
    success: true,
    attemptId:
      attempt.id,
    startedAt:
      attempt.startedAt,
    resumed: false,
  };
}

type SubmitMockExamAnswer = {
  generatedQuestionId: string;
  answerData:
    | string
    | Record<string, string>;
};

type SubmitMockExamInput = {
  attemptId: string;
  answers: SubmitMockExamAnswer[];
};

export async function submitMockExamAttempt(
  input: SubmitMockExamInput,
) {
  const user = await requireUser();

  const attempt =
    await prisma.mockExamAttempt.findFirst({
      where: {
        id: input.attemptId,
        userId: user.id,
        completed: false,
      },

      include: {
        mockExam: {
          include: {
            questions: {
              include: {
                generatedQuestion: {
                  select: {
                    id: true,
                    type: true,
                    marks: true,
                    questionData: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  if (!attempt) {
    throw new Error(
      "Active mock exam attempt not found.",
    );
  }

  const submittedAnswerMap =
    new Map(
      input.answers.map(
        (answer) => [
          answer.generatedQuestionId,
          answer.answerData,
        ],
      ),
    );

  const submittedAt = new Date();

  const timeSpent = Math.max(
    0,
    Math.floor(
      (submittedAt.getTime() -
        attempt.startedAt.getTime()) /
        1000,
    ),
  );

  await prisma.$transaction(
    async (tx) => {
      for (
        const examQuestion
        of attempt.mockExam.questions
      ) {
        const question =
          examQuestion.generatedQuestion;

        const answerData =
          submittedAnswerMap.get(
            question.id,
          ) ?? "";

        let isCorrect:
          | boolean
          | null = null;

        let awardedMarks:
          | number
          | null = null;

        if (
          question.type === "MCQ"
        ) {
          const questionData =
            question.questionData;

          if (
            questionData &&
            typeof questionData ===
              "object" &&
            !Array.isArray(
              questionData,
            ) &&
            "correctOption" in
              questionData
          ) {
            const correctOption =
              questionData.correctOption;

            if (
              typeof correctOption ===
                "string" &&
              typeof answerData ===
                "string"
            ) {
              isCorrect =
                answerData ===
                correctOption;

              awardedMarks =
                isCorrect
                  ? examQuestion.marks ??
                    question.marks ??
                    0
                  : 0;
            }
          }
        }

        await tx.mockExamAnswer.upsert({
          where: {
            attemptId_mockExamQuestionId:
              {
                attemptId:
                  attempt.id,

                mockExamQuestionId:
                  examQuestion.id,
              },
          },

          create: {
            attemptId:
              attempt.id,

            mockExamQuestionId:
              examQuestion.id,

            answerData,

            isCorrect,

            awardedMarks,
          },

          update: {
            answerData,

            isCorrect,

            awardedMarks,
          },
        });
      }

      await tx.mockExamAttempt.update({
        where: {
          id: attempt.id,
        },

        data: {
          submittedAt,
          timeSpent,
          completed: true,
        },
      });

      await tx.mockExam.update({
        where: {
          id: attempt.mockExamId,
        },

        data: {
          status: "COMPLETED",
        },
      });
    },
  );

  revalidatePath(
    `/mock-exams/${attempt.mockExamId}`,
  );

  revalidatePath(
    "/mock-exams",
  );

  return {
    success: true,
    attemptId: attempt.id,
  };
}