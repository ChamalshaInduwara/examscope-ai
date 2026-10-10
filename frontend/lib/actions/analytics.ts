"use server";

import { requireUser } from "@/lib/auth/session";
import type { HistoricalAnalyticsResult } from "@/lib/api/fastapi";
import { prisma } from "@/lib/db/prisma";

export async function getSubjectHistoricalAnalytics(
  subjectId: string,
): Promise<HistoricalAnalyticsResult | null> {
  const user = await requireUser();

  const subject = await prisma.subject.findFirst({
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
    return null;
  }

  const questions = await prisma.question.findMany({
    where: {
      subjectId: subject.id,
    },

    select: {
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
  });

  const documents = await prisma.document.findMany({
    where: {
      subjectId: subject.id,
    },

    select: {
      id: true,
    },
  });

  const topicMap = new Map<
    string,
    {
      topic_name: string;
      total_questions: number;
      total_marks: number;
      yearly: Map<
        number,
        {
          question_count: number;
          total_marks: number;
        }
      >;
    }
  >();

  let totalMarks = 0;

  for (const question of questions) {
    const marks = question.marks ?? 0;

    totalMarks += marks;

    if (!question.topicId || !question.topic) {
      continue;
    }

    const current = topicMap.get(question.topicId) ?? {
      topic_name: question.topic.name,
      total_questions: 0,
      total_marks: 0,
      yearly: new Map<
        number,
        {
          question_count: number;
          total_marks: number;
        }
      >(),
    };

    current.total_questions += 1;
    current.total_marks += marks;

    if (question.year !== null) {
      const yearly = current.yearly.get(question.year) ?? {
        question_count: 0,
        total_marks: 0,
      };

      yearly.question_count += 1;
      yearly.total_marks += marks;

      current.yearly.set(question.year, yearly);
    }

    topicMap.set(question.topicId, current);
  }

  const topicAnalytics = Array.from(topicMap.values()).map((topic) => ({
    topic_name: topic.topic_name,
    total_questions: topic.total_questions,
    total_marks: topic.total_marks,
    average_marks:
      topic.total_questions > 0 ? topic.total_marks / topic.total_questions : 0,
    yearly_frequency: Array.from(topic.yearly.entries())
      .map(([year, yearly]) => ({
        year,
        question_count: yearly.question_count,
        total_marks: yearly.total_marks,
      }))
      .sort((a, b) => a.year - b.year),
  }));

  const questionTypeCounts = new Map<string, number>();

  for (const question of questions) {
    questionTypeCounts.set(
      question.type,
      (questionTypeCounts.get(question.type) ?? 0) + 1,
    );
  }

  const questionTypeDistribution = Array.from(questionTypeCounts.entries()).map(
    ([name, count]) => ({
      name,
      count,
      percentage: questions.length > 0 ? (count / questions.length) * 100 : 0,
    }),
  );

  return {
    total_papers: documents.length,
    total_questions: questions.length,
    total_marks: totalMarks,
    topic_analytics: topicAnalytics,
    question_type_distribution: questionTypeDistribution,
    difficulty_distribution: [],
    command_verb_distribution: [],
  };
}

export type AnalyticsDashboardData = {
  overview: {
    subjects: number;
    documents: number;
    questions: number;
    generatedQuestions: number;
    revisionItems: number;
    completedMockExams: number;
  };

  questionTypes: {
    name: string;
    count: number;
  }[];

  questionsByYear: {
    year: number;
    count: number;
  }[];

  topTopics: {
    name: string;
    subjectName: string;
    questionCount: number;
  }[];

  topPredictions: {
    id: string;
    title: string;
    score: number;
    subjectName: string;
    topicName: string | null;
  }[];
};

export async function getAnalyticsDashboardData(): Promise<AnalyticsDashboardData> {
  const user = await requireUser();

  const [
    subjects,
    documents,
    questions,
    generatedQuestions,
    revisionItems,
    completedMockExams,
    topics,
    predictions,
  ] = await Promise.all([
    prisma.subject.findMany({
      where: {
        userId: user.id,
        archived: false,
      },
      select: {
        id: true,
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

    prisma.question.findMany({
      where: {
        subject: {
          userId: user.id,
          archived: false,
        },
      },
      select: {
        type: true,
        year: true,
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

    prisma.revisionItem.count({
      where: {
        userId: user.id,
        subject: {
          archived: false,
        },
      },
    }),

    prisma.mockExamAttempt.count({
      where: {
        userId: user.id,
        completed: true,
        mockExam: {
          subject: {
            archived: false,
          },
        },
      },
    }),

    prisma.topic.findMany({
      where: {
        subject: {
          userId: user.id,
          archived: false,
        },
      },
      select: {
        name: true,
        subject: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    }),

    prisma.prediction.findMany({
      where: {
        subject: {
          userId: user.id,
          archived: false,
        },
      },
      orderBy: {
        score: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        score: true,
        subject: {
          select: {
            name: true,
          },
        },
        topic: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const questionTypeMap = new Map<string, number>();

  for (const question of questions) {
    questionTypeMap.set(
      question.type,
      (questionTypeMap.get(question.type) ?? 0) + 1,
    );
  }

  const yearMap = new Map<number, number>();

  for (const question of questions) {
    if (question.year === null) {
      continue;
    }

    yearMap.set(question.year, (yearMap.get(question.year) ?? 0) + 1);
  }

  return {
    overview: {
      subjects: subjects.length,
      documents,
      questions: questions.length,
      generatedQuestions,
      revisionItems,
      completedMockExams,
    },

    questionTypes: Array.from(questionTypeMap.entries()).map(
      ([name, count]) => ({
        name,
        count,
      }),
    ),

    questionsByYear: Array.from(yearMap.entries())
      .map(([year, count]) => ({
        year,
        count,
      }))
      .sort((a, b) => a.year - b.year),

    topTopics: topics
      .map((topic) => ({
        name: topic.name,
        subjectName: topic.subject.name,
        questionCount: topic._count.questions,
      }))
      .sort((a, b) => b.questionCount - a.questionCount)
      .slice(0, 8),

    topPredictions: predictions.map((prediction) => ({
      id: prediction.id,
      title: prediction.title,
      score: prediction.score,
      subjectName: prediction.subject.name,
      topicName: prediction.topic?.name ?? null,
    })),
  };
}
