import type { InitiativeStatus } from "@/lib/types";

const statusConfig: Record<
  InitiativeStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  ikke_startet: {
    label: "Ikke startet",
    bg: "bg-cream-dark",
    text: "text-text-muted",
    dot: "bg-status-pending",
  },
  i_gang: {
    label: "I gang",
    bg: "bg-amber-50",
    text: "text-amber-800",
    dot: "bg-status-progress",
  },
  færdig: {
    label: "Færdig",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    dot: "bg-status-done",
  },
};

interface StatusBadgeProps {
  status: InitiativeStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
