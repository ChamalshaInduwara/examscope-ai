import {
  BookOpen,
  BrainCircuit,
  FileQuestion,
  Upload,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to ExamScope AI
        </h1>

        <p className="mt-2 text-muted-foreground">
          Upload learning materials, analyze past papers, discover important
          topics and prepare for your upcoming exams.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              My Subjects
            </CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Subjects added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Uploaded Files
            </CardTitle>
            <Upload className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Documents uploaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Predictions
            </CardTitle>
            <BrainCircuit className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Generated predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Practice Questions
            </CardTitle>
            <FileQuestion className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Questions generated
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Subjects</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <BookOpen className="mx-auto size-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  No subjects yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first subject to begin studying.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Your recent study activity will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}