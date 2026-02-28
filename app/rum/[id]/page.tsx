import { notFound } from "next/navigation";
import RoomDetail from "@/components/RoomDetail";
import RoomPageContent from "@/components/RoomPageContent";
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
    <RoomPageContent
      room={room}
      done={done}
      total={total}
      unresolvedQuestions={unresolvedQuestions}
    >
      <RoomDetail room={room} />
    </RoomPageContent>
  );
}
