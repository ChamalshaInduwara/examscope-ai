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
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium",

    PROCESSING:
      "border-[#0466c8]/40 bg-[#0466c8]/10 text-[#0466c8] dark:text-[#388bfd] font-semibold animate-pulse",

    COMPLETED:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium",

    FAILED:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium",
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