"use client";

import { useRouter, useSearchParams } from "next/navigation";

type TopicOption = {
  id: string;
  name: string;
};

type QuestionHistoryFiltersProps = {
  years: number[];
  topics: TopicOption[];
  selectedYear?: number;
  selectedType?: string;
  selectedTopicId?: string;
};

export function QuestionHistoryFilters({
  years,
  topics,
  selectedYear,
  selectedType,
  selectedTopicId,
}: QuestionHistoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(
    key: string,
    value: string
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(
      `/analysis/questions?${params.toString()}`
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-2">
        <label
          htmlFor="year"
          className="text-sm font-medium"
        >
          Year
        </label>

        <select
          id="year"
          value={
            selectedYear?.toString() ?? ""
          }
          onChange={(event) =>
            updateFilter(
              "year",
              event.target.value
            )
          }
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All years
          </option>

          {years.map((year) => (
            <option
              key={year}
              value={year}
            >
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="type"
          className="text-sm font-medium"
        >
          Question Type
        </label>

        <select
          id="type"
          value={selectedType ?? ""}
          onChange={(event) =>
            updateFilter(
              "type",
              event.target.value
            )
          }
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All types
          </option>
          <option value="MCQ">
            MCQ
          </option>
          <option value="STRUCTURED">
            Structured
          </option>
          <option value="ESSAY">
            Essay
          </option>
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="topic"
          className="text-sm font-medium"
        >
          Topic
        </label>

        <select
          id="topic"
          value={
            selectedTopicId ?? ""
          }
          onChange={(event) =>
            updateFilter(
              "topic",
              event.target.value
            )
          }
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">
            All topics
          </option>

          {topics.map((topic) => (
            <option
              key={topic.id}
              value={topic.id}
            >
              {topic.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}