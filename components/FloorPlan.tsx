"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Room } from "@/lib/types";
import { getRoomStats, type RoomStats } from "@/lib/room-stats";

interface RoomPolygon {
  points: string;
  labelX: number;
  labelY: number;
}

// SVG polygon coordinates mapped to the basement floor plan (natural size ~1336x756)
const ROOM_POLYGONS: Record<number, RoomPolygon> = {
  4: { points: "808,36 1189,36 1189,631 808,631", labelX: 998, labelY: 334 },
  5: { points: "638,200 790,200 790,458 638,458", labelX: 714, labelY: 329 },
  6: { points: "455,43 626,43 626,458 455,458", labelX: 540, labelY: 250 },
  7: { points: "457,467 790,467 790,631 457,631", labelX: 624, labelY: 549 },
  8: { points: "121,254 448,254 448,734 121,734", labelX: 284, labelY: 494 },
  9: { points: "121,70 446,70 446,244 121,244", labelX: 283, labelY: 157 },
};

function getRoomFillColor(stats: RoomStats): string {
  const { done, inProgress, total } = stats;

  if (total === 0) return "rgba(155,155,155,0.25)";
  if (done === total) return "rgba(74,158,107,0.3)";
  if (inProgress > 0 || done > 0) return "rgba(212,168,67,0.3)";
  return "rgba(155,155,155,0.2)";
}

interface FloorPlanProps {
  rooms: Room[];
}

export default function FloorPlan({ rooms }: FloorPlanProps) {
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const router = useRouter();
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]));

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border-light bg-white">
      <svg
        viewBox="0 0 1336 756"
        className="w-full h-auto block"
        role="img"
        aria-label="Plantegning over kælderen"
      >
        <image
          href="/plantegning_basement.png"
          width="1336"
          height="756"
          preserveAspectRatio="xMidYMid meet"
        />
        {Object.entries(ROOM_POLYGONS).map(([idStr, poly]) => {
          const id = Number(idStr);
          const room = roomMap[id];
          if (!room) return null;

          const isHovered = hoveredRoom === id;
          const stats = getRoomStats(room);

          return (
            <g
              key={id}
              role="link"
              tabIndex={0}
              aria-label={`Gå til rum ${room.id}: ${room.name}`}
              onClick={() => router.push(`/rum/${id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/rum/${id}`);
              }}
              onMouseEnter={() => setHoveredRoom(id)}
              onMouseLeave={() => setHoveredRoom(null)}
              onFocus={() => setHoveredRoom(id)}
              onBlur={() => setHoveredRoom(null)}
              className="cursor-pointer"
            >
              <polygon
                points={poly.points}
                fill={isHovered ? "rgba(217,119,87,0.25)" : getRoomFillColor(stats)}
                stroke={isHovered ? "#D97757" : "rgba(26,26,26,0.15)"}
                strokeWidth={isHovered ? 3 : 1.5}
                className="transition-all duration-150"
              />
              {isHovered && (
                <RoomTooltip
                  poly={poly}
                  room={room}
                  unresolvedQuestions={stats.unresolvedQuestions}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface RoomTooltipProps {
  poly: RoomPolygon;
  room: Room;
  unresolvedQuestions: number;
}

function RoomTooltip({ poly, room, unresolvedQuestions }: RoomTooltipProps) {
  const subtitle = unresolvedQuestions > 0
    ? `${room.initiatives.length} initiativer · ${unresolvedQuestions} spørgsmål`
    : `${room.initiatives.length} initiativer`;

  return (
    <g>
      <rect
        x={poly.labelX - 100}
        y={poly.labelY - 32}
        width={200}
        height={64}
        rx={8}
        fill="white"
        stroke="#E5E4E0"
        strokeWidth={1}
        opacity={0.95}
      />
      <text
        x={poly.labelX}
        y={poly.labelY - 8}
        textAnchor="middle"
        className="fill-text-primary text-[16px] font-semibold"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {room.id}: {room.name}
      </text>
      <text
        x={poly.labelX}
        y={poly.labelY + 16}
        textAnchor="middle"
        className="fill-text-secondary text-[13px]"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {subtitle}
      </text>
    </g>
  );
}
