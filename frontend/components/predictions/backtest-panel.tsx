"use client";

import { FormEvent, useState } from "react";
import { FlaskConical } from "lucide-react";

import { runPredictionBacktest } from "@/lib/actions/predictions";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { PredictionBacktestResult } from "@/lib/api/fastapi";

type BacktestPanelProps = {
  subjectId: string;
};

function formatPercentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function BacktestPanel({
  subjectId,
}: BacktestPanelProps) {
  const [actualTopicsText, setActualTopicsText] =
    useState("");

  const [result, setResult] =
    useState<PredictionBacktestResult | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const actualTopics =
      actualTopicsText
        .split(/[\n,]+/)
        .map((topic) => topic.trim())
        .filter(Boolean);

    if (actualTopics.length === 0) {
      setError(
        "Enter at least one actual topic.",
      );

      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const backtestResult =
        await runPredictionBacktest(
          subjectId,
          actualTopics,
        );

      setResult(backtestResult);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to run backtest.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <FlaskConical className="mt-1 size-5 text-muted-foreground" />

          <div>
            <CardTitle>
              Prediction Backtest
            </CardTitle>

            <CardDescription className="mt-1">
              Compare generated predictions
              against topics that actually
              appeared in a held-out exam.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label
              htmlFor="actualTopics"
              className="text-sm font-medium"
            >
              Actual exam topics
            </label>

            <textarea
              id="actualTopics"
              value={actualTopicsText}
              onChange={(event) =>
                setActualTopicsText(
                  event.target.value,
                )
              }
              placeholder={
                "Photosynthesis\nGenetics\nCell division"
              }
              rows={5}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />

            <p className="text-xs text-muted-foreground">
              Enter one topic per line or
              separate topics with commas.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Running Backtest..."
              : "Run Backtest"}
          </button>
        </form>

        {error ? (
          <p className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="space-y-5 border-t pt-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Hit Rate"
                value={formatPercentage(
                  result.hit_rate,
                )}
              />

              <MetricCard
                label="Precision"
                value={formatPercentage(
                  result.precision_at_k,
                )}
              />

              <MetricCard
                label="Matched Topics"
                value={`${result.hit_count} / ${result.actual_topics.length}`}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Predicted topics
              </h3>

              <div className="mt-2 flex flex-wrap gap-2">
                {result.predicted_topics.map(
                  (topic, index) => (
                    <span
                      key={`${topic}-${index}`}
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      #{index + 1} {topic}
                    </span>
                  ),
                )}
              </div>
            </div>

            {result.matches.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold">
                  Matches
                </h3>

                <div className="mt-2 space-y-2">
                  {result.matches.map(
                    (match, index) => (
                      <div
                        key={`${match.predicted_topic}-${index}`}
                        className="rounded-md border p-3 text-sm"
                      >
                        <p className="font-medium">
                          #{match.predicted_rank}{" "}
                          {
                            match.predicted_topic
                          }
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Actual topic:{" "}
                          {match.actual_topic} •
                          Prediction score:{" "}
                          {formatPercentage(
                            match.prediction_score,
                          )}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : null}

            {result.missed_actual_topics.length >
            0 ? (
              <div>
                <h3 className="text-sm font-semibold">
                  Missed actual topics
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {result.missed_actual_topics.join(
                    ", ",
                  )}
                </p>
              </div>
            ) : null}

            <p className="text-xs leading-5 text-muted-foreground">
              Backtesting evaluates historical
              prediction performance. It does
              not guarantee future exam
              questions.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold">
        {value}
      </p>
    </div>
  );
}