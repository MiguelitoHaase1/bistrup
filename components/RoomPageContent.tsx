"use client";

import Link from "next/link";
import type { Room, Floor } from "@/lib/types";
import MiniFloorPlan from "@/components/MiniFloorPlan";

const TABS: { id: Floor | "hele_huset"; label: string; href: string }[] = [
  { id: "kælder", label: "Kælder", href: "/oversigt?tab=kælder" },
  { id: "1.sal", label: "Ovenpå", href: "/oversigt?tab=1.sal" },
  { id: "hele_huset", label: "Hele huset", href: "/oversigt?tab=hele_huset" },
];

interface RoomPageContentProps {
  room: Room;
  done: number;
  total: number;
  unresolvedQuestions: number;
  children: React.ReactNode;
}

export default function RoomPageContent({
  room,
  done,
  total,
  unresolvedQuestions,
  children,
}: RoomPageContentProps) {
  const activeFloor: Floor | "hele_huset" = room.floor;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Persistent floor tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 no-print">
        <div className="flex gap-1 bg-cream-dark rounded-lg p-1">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                activeFloor === tab.id
                  ? "bg-white text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column layout: room detail + mini floor plan */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 max-w-4xl">
          <Link
            href={`/oversigt?tab=${room.floor}`}
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
            Tilbage til {room.floor === "kælder" ? "Kælder" : "1. sal"}
          </Link>

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

          {children}
        </div>

        {/* Sidebar: mini floor plan */}
        <aside className="lg:w-72 xl:w-80 shrink-0 no-print">
          <div className="lg:sticky lg:top-24">
            <MiniFloorPlan currentRoomId={room.id} floor={room.floor} />
          </div>
        </aside>
      </div>
    </div>
  );
}
