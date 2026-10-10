"use server";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export type DashboardData = {
  overview: {
    subjects: number;
    documents: number;
    predictions: number;
    generatedQuestions: number;
  };

  recentSubjects: {
    id: string;
    name: string;
    code: string | null;
    documentCount: number;
    generatedQuestionCount: number;
    updatedAt: Date;
  }[];

  recentActivity: {
    id: string;
    type:
      | "DOCUMENT"
      | "GENERATED_QUESTION"
      | "MOCK_EXAM";
    title: string;
    subjectName: string;
    createdAt: Date;
  }[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const user = await requireUser();

  const [
    subjectCount,
    documentCount,
    predictionCount,
    generatedQuestionCount,
    recentSubjects,
    recentDocuments,
    recentGeneratedQuestions,
    recentMockExams,
  ] = await Promise.all([
    prisma.subject.count({
      where: {
        userId: user.id,
        archived: false,
      },
    }),

    prisma.document.count({
      where: {
        subject: {
          userId: user.id,
          archived: false,
        },
      },
    }),

    prisma.prediction.count({
      where: {
        subject: {
          userId: user.id,
          archived: false,
        },
      },
    }),

    prisma.generatedQuestion.count({
      where: {
        userId: user.id,
        subject: {
          archived: false,
        },
      },
    }),

    prisma.subject.findMany({
      where: {
        userId: user.id,
        archived: false,
      },

      orderBy: {
        updatedAt: "desc",
      },

      take: 4,

      select: {
        id: true,
        name: true,
        code: true,
        updatedAt: true,

        _count: {
          select: {
            documents: true,
            generatedQuestions: true,
          },
        },
      },
    }),

    prisma.document.findMany({
      where: {
        subject: {
          userId: user.id,
          archived: false,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        title: true,
        createdAt: true,

        subject: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.generatedQuestion.findMany({
      where: {
        userId: user.id,
        subject: {
          archived: false,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        questionText: true,
        createdAt: true,

        subject: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.mockExam.findMany({
      where: {
        userId: user.id,
        subject: {
          archived: false,
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 5,

      select: {
        id: true,
        title: true,
        createdAt: true,

        subject: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const recentActivity: DashboardData["recentActivity"] = [
    ...recentDocuments.map((document) => ({
      id: document.id,
      type: "DOCUMENT" as const,
      title: document.title,
      subjectName: document.subject.name,
      createdAt: document.createdAt,
    })),

    ...recentGeneratedQuestions.map((question) => ({
      id: question.id,
      type: "GENERATED_QUESTION" as const,
      title: question.questionText,
      subjectName: question.subject.name,
      createdAt: question.createdAt,
    })),

    ...recentMockExams.map((exam) => ({
      id: exam.id,
      type: "MOCK_EXAM" as const,
      title: exam.title,
      subjectName: exam.subject.name,
      createdAt: exam.createdAt,
    })),
  ]
    .sort(
      (a, b) =>
        b.createdAt.getTime() -
        a.createdAt.getTime(),
    )
    .slice(0, 6);

  return {
    overview: {
      subjects: subjectCount,
      documents: documentCount,
      predictions: predictionCount,
      generatedQuestions: generatedQuestionCount,
    },

    recentSubjects: recentSubjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      documentCount: subject._count.documents,
      generatedQuestionCount:
        subject._count.generatedQuestions,
      updatedAt: subject.updatedAt,
    })),

    recentActivity,
  };
}