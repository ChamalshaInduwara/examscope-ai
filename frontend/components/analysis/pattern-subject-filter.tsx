"use client";

import { useRouter } from "next/navigation";

type Subject = {
  id: string;
  name: string;
  code: string | null;
};

type PatternSubjectFilterProps = {
  subjects: Subject[];
  selectedSubjectId?: string;
};

export function PatternSubjectFilter({
  subjects,
  selectedSubjectId,
}: PatternSubjectFilterProps) {
  const router = useRouter();

  function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const subjectId = event.target.value;

    if (!subjectId) {
      router.push("/analysis/patterns");
      return;
    }

    router.push(
      `/analysis/patterns?subject=${encodeURIComponent(
        subjectId
      )}`
    );
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="pattern-subject"
        className="text-sm font-medium"
      >
        Subject
      </label>

      <select
        id="pattern-subject"
        value={selectedSubjectId ?? ""}
        onChange={handleChange}
        className="h-10 w-full rounded-md border bg-background px-3 text-sm sm:max-w-sm"
      >
        <option value="">
          All subjects
        </option>

        {subjects.map((subject) => (
          <option
            key={subject.id}
            value={subject.id}
          >
            {subject.name}
            {subject.code
              ? ` (${subject.code})`
              : ""}
          </option>
        ))}
      </select>
    </div>
  );
}