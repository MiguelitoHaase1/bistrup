import Link from "next/link";
import type { Room } from "@/lib/types";
import { getRoomStats } from "@/lib/room-stats";
import ProgressBar from "./ProgressBar";

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const { done, inProgress, total, unresolvedQuestions } = getRoomStats(room);

  return (
    <Link href={`/rum/${room.id}`}>
      <div className="card p-5 hover:border-coral/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-xs font-medium text-coral">Rum {room.id}</span>
            <h3 className="heading text-lg font-semibold text-text-primary">
              {room.name}
            </h3>
          </div>
          {unresolvedQuestions > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-status-progress bg-amber-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-status-progress" />
              {unresolvedQuestions} spørgsmål
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary mb-4 line-clamp-2">
          {room.description}
        </p>
        <ProgressBar done={done} inProgress={inProgress} total={total} />
      </div>
    </Link>
  );
}
