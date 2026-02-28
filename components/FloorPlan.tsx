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
                <RoomTooltip poly={poly} room={room} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length + word.length + 1 > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
    if (lines.length === 3) {
      lines[2] = truncate(lines[2] + " " + words.slice(words.indexOf(word) + 1).join(" "), maxCharsPerLine);
      break;
    }
  }
  if (lines.length < 3 && current) lines.push(current);
  return lines;
}

interface RoomTooltipProps {
  poly: RoomPolygon;
  room: Room;
}

function RoomTooltip({ poly, room }: RoomTooltipProps) {
  const descLines = wrapText(room.description, 32);
  const lineHeight = 18;
  const titleHeight = 26;
  const padding = 16;
  const tooltipHeight = titleHeight + descLines.length * lineHeight + padding * 2;
  const tooltipWidth = 280;

  return (
    <g>
      <rect
        x={poly.labelX - tooltipWidth / 2}
        y={poly.labelY - tooltipHeight / 2}
        width={tooltipWidth}
        height={tooltipHeight}
        rx={8}
        fill="white"
        stroke="#E5E4E0"
        strokeWidth={1}
        opacity={0.97}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"
      />
      <text
        x={poly.labelX}
        y={poly.labelY - tooltipHeight / 2 + padding + 14}
        textAnchor="middle"
        className="fill-text-primary text-[15px] font-semibold"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {room.id}: {room.name}
      </text>
      {descLines.map((line, i) => (
        <text
          key={i}
          x={poly.labelX}
          y={poly.labelY - tooltipHeight / 2 + padding + titleHeight + 6 + i * lineHeight}
          textAnchor="middle"
          className="fill-text-secondary text-[12px]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {line}
        </text>
      ))}
    </g>
  );
}
