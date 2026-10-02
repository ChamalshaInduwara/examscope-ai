import {
  BrainCircuit,
  ChartNoAxesColumnIncreasing,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { BacktestPanel } from "@/components/predictions/backtest-panel";
import { generatePredictions } from "@/lib/actions/predictions";

type PredictionsPageProps = {
  searchParams: Promise<{
    subject?: string;
  }>;
};

function formatScore(score: number) {
  return `${Math.round(score * 100)}%`;
}

function getRevisionPriority(score: number) {
  if (score >= 0.7) {
    return "High";
  }

  if (score >= 0.5) {
    return "Medium";
  }

  return "Low";
}

export default async function PredictionsPage({
  searchParams,
}: PredictionsPageProps) {
  const user = await requireUser();

  const params = await searchParams;

  const subjects = await prisma.subject.findMany({
    where: {
      userId: user.id,
      archived: false,
    },

    select: {
      id: true,
      name: true,
      code: true,
    },

    orderBy: {
      name: "asc",
    },
  });

  const selectedSubjectId = subjects.some(
    (subject) => subject.id === params.subject,
  )
    ? params.subject
    : undefined;

  const predictions = await prisma.prediction.findMany({
    where: {
      subject: {
        userId: user.id,
        archived: false,
      },

      ...(selectedSubjectId
        ? {
            subjectId: selectedSubjectId,
          }
        : {}),
    },

    include: {
      subject: {
        select: {
          name: true,
          code: true,
        },
      },

      topic: {
        select: {
          name: true,
        },
      },
    },

    orderBy: [
      {
        rank: "asc",
      },
      {
        score: "desc",
      },
    ],
  });

  const averageScore =
    predictions.length > 0
      ? predictions.reduce((total, prediction) => total + prediction.score, 0) /
        predictions.length
      : 0;

  const linkedTopics = new Set(
    predictions.map((prediction) => prediction.topicId).filter(Boolean),
  ).size;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Predictions</h1>

        <p className="mt-2 text-muted-foreground">
          Review AI-generated exam topic predictions based on historical
          evidence and analysis.
        </p>
      </div>

      <form method="get" className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>

        <select
          id="subject"
          name="subject"
          defaultValue={selectedSubjectId ?? ""}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm sm:max-w-sm"
        >
          <option value="">All subjects</option>

          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
              {subject.code ? ` (${subject.code})` : ""}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="ml-2 h-10 rounded-md border px-4 text-sm"
        >
          Apply
        </button>
      </form>

      {selectedSubjectId ? (
        <form action={generatePredictions}>
          <input type="hidden" name="subjectId" value={selectedSubjectId} />

          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            <WandSparkles className="size-4" />
            Generate Predictions
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a subject to generate predictions.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Predictions
              <Target className="size-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Average Score
              <ChartNoAxesColumnIncreasing className="size-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {predictions.length ? formatScore(averageScore) : "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              Topics Covered
              <BrainCircuit className="size-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{linkedTopics}</div>
          </CardContent>
        </Card>
      </div>

      {selectedSubjectId ? (
        <BacktestPanel subjectId={selectedSubjectId} />
      ) : null}

      {predictions.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-80 items-center justify-center">
            <div className="max-w-lg text-center">
              <Sparkles className="mx-auto size-12 text-muted-foreground" />

              <h2 className="mt-5 text-lg font-semibold">
                No predictions generated yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your processed documents, questions and topic patterns are
                ready, but the FastAPI prediction engine has not generated
                prediction records yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <Card key={prediction.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>
                      {prediction.rank ? `#${prediction.rank} ` : ""}
                      {prediction.title}
                    </CardTitle>

                    <CardDescription className="mt-2">
                      {prediction.subject.name}

                      {prediction.subject.code
                        ? ` (${prediction.subject.code})`
                        : ""}

                      {prediction.topic ? ` • ${prediction.topic.name}` : ""}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getRevisionPriority(prediction.score)} priority
                    </Badge>

                    <Badge>{formatScore(prediction.score)}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {prediction.explanation ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {prediction.explanation}
                  </p>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <ScoreCard
                    label="Recurrence"
                    value={prediction.recurrenceScore}
                  />

                  <ScoreCard
                    label="Similarity"
                    value={prediction.similarityScore}
                  />

                  <ScoreCard label="Recency" value={prediction.recencyScore} />

                  <ScoreCard
                    label="Importance"
                    value={prediction.importanceScore}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Prediction methodology</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Prediction scores are intended to combine recurrence, similarity,
            recency and topic importance evidence. They should be treated as
            study guidance, not guarantees of future exam questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-lg font-semibold">
        {value === null ? "—" : formatScore(value)}
      </p>
    </div>
  );
}
