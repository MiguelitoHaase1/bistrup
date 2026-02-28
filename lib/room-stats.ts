import type { Room } from "@/lib/types";

export interface RoomStats {
  done: number;
  inProgress: number;
  total: number;
  unresolvedQuestions: number;
}

export function getRoomStats(room: Room): RoomStats {
  const done = room.initiatives.filter((i) => i.status === "færdig").length;
  const inProgress = room.initiatives.filter((i) => i.status === "i_gang").length;
  const total = room.initiatives.length;
  const unresolvedQuestions = room.openQuestions.filter((q) => !q.resolved).length;

  return { done, inProgress, total, unresolvedQuestions };
}

export function getAggregateStats(rooms: Room[]): RoomStats {
  const all = rooms.flatMap((r) => r.initiatives);
  const done = all.filter((i) => i.status === "færdig").length;
  const inProgress = all.filter((i) => i.status === "i_gang").length;
  const total = all.length;
  const unresolvedQuestions = rooms
    .flatMap((r) => r.openQuestions)
    .filter((q) => !q.resolved).length;

  return { done, inProgress, total, unresolvedQuestions };
}
