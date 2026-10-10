import {
  BookOpen,
  BrainCircuit,
  FileQuestion,
  GraduationCap,
  LibraryBig,
  Trophy,
} from "lucide-react";

import {
  QuestionTypeChart,
  QuestionsByYearChart,
} from "@/components/analytics/analytics-charts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAnalyticsDashboardData } from "@/lib/actions/analytics";

export default async function AnalyticsPage() {
  const data = await getAnalyticsDashboardData();

  const overviewCards = [
    {
      title: "Subjects",
      value: data.overview.subjects,
      description: "Active subjects",
      icon: BookOpen,
    },
    {
      title: "Documents",
      value: data.overview.documents,
      description: "Uploaded learning files",
      icon: LibraryBig,
    },
    {
      title: "Past Questions",
      value: data.overview.questions,
      description: "Analyzed past-paper questions",
      icon: FileQuestion,
    },
    {
      title: "Practice Questions",
      value: data.overview.generatedQuestions,
      description: "AI-generated questions",
      icon: GraduationCap,
    },
    {
      title: "Revision Items",
      value: data.overview.revisionItems,
      description: "Saved for revision",
      icon: BrainCircuit,
    },
    {
      title: "Mock Exams",
      value: data.overview.completedMockExams,
      description: "Completed attempts",
      icon: Trophy,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics
        </h1>

        <p className="mt-2 text-muted-foreground">
          Track your study activity, question trends,
          predictions and revision progress.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>

                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {card.value}
                </div>

                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Question Type Distribution
            </CardTitle>
          </CardHeader>

          <CardContent>
            <QuestionTypeChart
              data={data.questionTypes}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Questions by Year
            </CardTitle>
          </CardHeader>

          <CardContent>
            <QuestionsByYearChart
              data={data.questionsByYear}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Top Topics
            </CardTitle>
          </CardHeader>

          <CardContent>
            {data.topTopics.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  No topic data is available yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.topTopics.map((topic, index) => (
                  <div
                    key={`${topic.subjectName}-${topic.name}`}
                    className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {index + 1}. {topic.name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {topic.subjectName}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-semibold">
                        {topic.questionCount}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        questions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Top Predictions
            </CardTitle>
          </CardHeader>

          <CardContent>
            {data.topPredictions.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  No prediction data is available yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.topPredictions.map(
                  (prediction, index) => (
                    <div
                      key={prediction.id}
                      className="border-b pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {index + 1}.{" "}
                            {prediction.title}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {prediction.subjectName}
                            {prediction.topicName
                              ? ` · ${prediction.topicName}`
                              : ""}
                          </p>
                        </div>

                        <span className="shrink-0 text-sm font-semibold">
                          {prediction.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}