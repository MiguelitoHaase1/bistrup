interface ProgressBarProps {
  done: number;
  inProgress: number;
  total: number;
}

export default function ProgressBar({ done, inProgress, total }: ProgressBarProps) {
  const donePct = total > 0 ? (done / total) * 100 : 0;
  const progressPct = total > 0 ? Math.min((inProgress / total) * 100, 100 - donePct) : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-text-secondary mb-1.5">
        <span>
          {done} af {total} initiativer
        </span>
        <span>{Math.round(donePct)}%</span>
      </div>
      <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
        <div className="h-full flex">
          <div
            className="bg-status-done transition-all duration-500"
            style={{ width: `${donePct}%` }}
          />
          <div
            className="bg-status-progress transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
