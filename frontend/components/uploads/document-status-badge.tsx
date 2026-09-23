import { Badge } from "@/components/ui/badge";

type ProcessingStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

type DocumentStatusBadgeProps = {
  status: ProcessingStatus;
};

export function DocumentStatusBadge({
  status,
}: DocumentStatusBadgeProps) {
  const labels: Record<ProcessingStatus, string> = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    COMPLETED: "Completed",
    FAILED: "Failed",
  };

  const classNames: Record<ProcessingStatus, string> = {
    PENDING:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",

    PROCESSING:
      "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",

    COMPLETED:
      "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",

    FAILED:
      "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  };

  return (
    <Badge
      variant="outline"
      className={classNames[status]}
    >
      {labels[status]}
    </Badge>
  );
}