"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Room } from "@/lib/types";
import { data } from "@/lib/data";

interface RoomPolygon {
  points: string;
  labelX: number;
  labelY: number;
}

const ROOM_POLYGONS: Record<number, RoomPolygon> = {
  4: { points: "808,36 1189,36 1189,631 808,631", labelX: 998, labelY: 334 },
  5: { points: "638,200 790,200 790,458 638,458", labelX: 714, labelY: 329 },
  6: { points: "455,43 626,43 626,458 455,458", labelX: 540, labelY: 250 },
  7: { points: "457,467 790,467 790,631 457,631", labelX: 624, labelY: 549 },
  8: { points: "121,254 448,254 448,734 121,734", labelX: 284, labelY: 494 },
  9: { points: "121,70 446,70 446,244 121,244", labelX: 283, labelY: 157 },
};

interface MiniFloorPlanProps {
  currentRoomId: number;
  floor: "kælder" | "1.sal";
}

export default function MiniFloorPlan({ currentRoomId, floor }: MiniFloorPlanProps) {
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const router = useRouter();

  // Only show for basement rooms (we don't have a 1.sal floor plan yet)
  if (floor !== "kælder") {
    return null;
  }

  const rooms = data.rooms.filter((r) => r.floor === "kælder");
  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]));

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border-light bg-cream-dark/50">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
          Plantegning — Kælder
        </p>
      </div>
      <div className="relative">
        <svg
          viewBox="0 0 1336 756"
          className="w-full h-auto block"
          role="img"
          aria-label="Mini-plantegning over kælderen"
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

            const isCurrent = id === currentRoomId;
            const isHovered = hoveredRoom === id && !isCurrent;

            return (
              <g
                key={id}
                role="link"
                tabIndex={0}
                aria-label={
                  isCurrent
                    ? `Du er her: ${room.name}`
                    : `Gå til rum ${room.id}: ${room.name}`
                }
                onClick={() => {
                  if (!isCurrent) router.push(`/rum/${id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isCurrent) router.push(`/rum/${id}`);
                }}
                onMouseEnter={() => setHoveredRoom(id)}
                onMouseLeave={() => setHoveredRoom(null)}
                className={isCurrent ? "cursor-default" : "cursor-pointer"}
              >
                <polygon
                  points={poly.points}
                  fill={
                    isCurrent
                      ? "rgba(217,48,37,0.35)"
                      : isHovered
                        ? "rgba(140,140,140,0.30)"
                        : "rgba(160,160,160,0.20)"
                  }
                  stroke={
                    isCurrent
                      ? "#C62828"
                      : isHovered
                        ? "rgba(80,80,80,0.4)"
                        : "rgba(120,120,120,0.25)"
                  }
                  strokeWidth={isCurrent ? 5 : isHovered ? 2 : 1}
                  className="transition-all duration-150"
                />
                <text
                  x={poly.labelX}
                  y={isCurrent ? poly.labelY - 12 : poly.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`font-semibold ${
                    isCurrent
                      ? "fill-[#C62828] text-[20px]"
                      : "fill-[#888] text-[16px]"
                  }`}
                  style={{ fontFamily: "var(--font-sans)", pointerEvents: "none" }}
                >
                  {isCurrent ? room.name : room.id}
                </text>
                {isCurrent && (
                  <text
                    x={poly.labelX}
                    y={poly.labelY + 16}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-[#C62828] text-[14px] font-bold"
                    style={{ fontFamily: "var(--font-sans)", pointerEvents: "none" }}
                  >
                    Du er her
                  </text>
                )}
                {isHovered && !isCurrent && (
                  <text
                    x={poly.labelX}
                    y={poly.labelY + 22}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-[#666] text-[13px]"
                    style={{ fontFamily: "var(--font-sans)", pointerEvents: "none" }}
                  >
                    {room.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
