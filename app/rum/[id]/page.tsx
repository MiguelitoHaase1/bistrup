import { notFound } from "next/navigation";
import Link from "next/link";
import RoomDetail from "@/components/RoomDetail";
import { data } from "@/lib/data";
import { getRoomStats } from "@/lib/room-stats";

export function generateStaticParams() {
  return data.rooms.map((room) => ({ id: String(room.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = data.rooms.find((r) => r.id === Number(id));

  return {
    title: room ? `${room.id}: ${room.name} — Bistrup` : "Rum ikke fundet",
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = data.rooms.find((r) => r.id === Number(id));

  if (!room) notFound();

  const { done, total, unresolvedQuestions } = getRoomStats(room);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-coral transition-colors mb-6 no-print"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Tilbage til oversigt
      </Link>

      {/* Room header */}
      <div className="mb-8">
        <span className="text-sm font-medium text-coral mb-2 block">
          Rum {room.id} · {room.floor === "kælder" ? "Kælder" : "1. sal"}
        </span>
        <h1 className="heading text-3xl font-bold text-text-primary mb-3">
          {room.name}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-text-secondary">
          <span>
            {done}/{total} initiativer færdige
          </span>
          {unresolvedQuestions > 0 && (
            <>
              <span className="text-border-medium">·</span>
              <span className="text-status-progress font-medium">
                {unresolvedQuestions} ubesvarede spørgsmål
              </span>
            </>
          )}
        </div>
      </div>

      <RoomDetail room={room} />
    </div>
  );
}
