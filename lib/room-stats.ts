import type { Room } from "@/lib/types";

export interface RoomStats {
  done: number;
  inProgress: number;
  total: number;
  unresolvedQuestions: number;
}

export function getRoomStats(room: Room): RoomStats {
  let done = 0;
  let inProgress = 0;

  for (const initiative of room.initiatives) {
    if (initiative.status === "færdig") done++;
    else if (initiative.status === "i_gang") inProgress++;
  }

  const unresolvedQuestions = room.openQuestions.filter(
    (q) => !q.resolved
  ).length;

  return { done, inProgress, total: room.initiatives.length, unresolvedQuestions };
}

export function getAggregateStats(rooms: Room[]): RoomStats {
  let done = 0;
  let inProgress = 0;
  let total = 0;
  let unresolvedQuestions = 0;

  for (const room of rooms) {
    const stats = getRoomStats(room);
    done += stats.done;
    inProgress += stats.inProgress;
    total += stats.total;
    unresolvedQuestions += stats.unresolvedQuestions;
  }

  return { done, inProgress, total, unresolvedQuestions };
}
