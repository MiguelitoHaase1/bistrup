import type { Room, Category } from "@/lib/types";
import StatusBadge from "./StatusBadge";

const CATEGORY_ORDER: Category[] = [
  "VVS",
  "El",
  "Gulv",
  "Vægge",
  "Loft",
  "Vinduer",
  "Ventilation",
  "Andet",
];

interface RoomDetailProps {
  room: Room;
}

export default function RoomDetail({ room }: RoomDetailProps) {
  const grouped = CATEGORY_ORDER
    .map((category) => ({
      category,
      items: room.initiatives.filter((i) => i.category === category),
    }))
    .filter((g) => g.items.length > 0);

  const unresolvedQuestions = room.openQuestions.filter((q) => !q.resolved);
  const resolvedQuestions = room.openQuestions.filter((q) => q.resolved);

  return (
    <div className="space-y-8">
      {/* Description */}
      <div className="card p-6">
        <p className="text-text-secondary leading-relaxed heading text-[17px]">
          {room.description}
        </p>
      </div>

      {/* Initiatives by category */}
      <div>
        <h2 className="heading text-xl font-semibold text-text-primary mb-4">
          Initiativer
        </h2>
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.category} className="card overflow-hidden">
              <div className="px-5 py-3 bg-cream-dark/50 border-b border-border-light">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                  {group.category}
                </h3>
              </div>
              <ul className="divide-y divide-border-light">
                {group.items.map((initiative, idx) => (
                  <li
                    key={idx}
                    className="px-5 py-3.5 flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-text-primary">
                      {initiative.description}
                    </span>
                    <StatusBadge status={initiative.status} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Open questions */}
      {unresolvedQuestions.length > 0 && (
        <div>
          <h2 className="heading text-xl font-semibold text-text-primary mb-4">
            Ubesvarede spørgsmål
            <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {unresolvedQuestions.length}
            </span>
          </h2>
          <div className="space-y-3">
            {unresolvedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3"
              >
                <span className="mt-0.5 text-status-progress text-lg">?</span>
                <div>
                  <p className="text-sm text-text-primary">{q.question}</p>
                  <span className="text-xs text-text-muted mt-1 block">
                    {q.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved questions */}
      {resolvedQuestions.length > 0 && (
        <div>
          <h2 className="heading text-xl font-semibold text-text-primary mb-4">
            Besvarede spørgsmål
          </h2>
          <div className="space-y-3">
            {resolvedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-emerald-50/50 border border-emerald-200/40 rounded-xl p-4"
              >
                <p className="text-sm text-text-secondary line-through">
                  {q.question}
                </p>
                {q.resolution && (
                  <p className="text-sm text-emerald-800 mt-1">
                    {q.resolution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {room.notes && (
        <div>
          <h2 className="heading text-xl font-semibold text-text-primary mb-4">
            Noter
          </h2>
          <div className="card p-5">
            <p className="text-sm text-text-secondary whitespace-pre-wrap">
              {room.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
