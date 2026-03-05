"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FloorPlan from "@/components/FloorPlan";
import FloorTabs, { type Tab } from "@/components/FloorTabs";
import QuestionCard from "@/components/QuestionCard";
import RoomCard from "@/components/RoomCard";
import { data } from "@/lib/data";
import type { Room } from "@/lib/types";

const VALID_TABS: Tab[] = ["kælder", "1.sal", "hele_huset"];

const FLOOR_CONFIG = {
  kælder: {
    title: "Kælder",
    description:
      "I kælderen er der, hvor de store forandringer sker. Klik på et rum i plantegningen eller i listen nedenfor.",
    hasFloorPlan: true,
  },
  "1.sal": {
    title: "1. sal",
    description:
      "På første sal handler det om at kombinere de to små badeværelser til ét større, og gøre soveværelserne mere behagelige.",
    hasFloorPlan: false,
  },
} as const;

export default function HomeContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const validTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : null;
  const [activeTab, setActiveTab] = useState<Tab>(validTab ?? "kælder");

  useEffect(() => {
    if (validTab) setActiveTab(validTab);
  }, [validTab]);

  const basementRooms = data.rooms.filter((r) => r.floor === "kælder");
  const upstairsRooms = data.rooms.filter((r) => r.floor === "1.sal");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <FloorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "kælder" && (
        <FloorView rooms={basementRooms} floor="kælder" />
      )}
      {activeTab === "1.sal" && (
        <FloorView rooms={upstairsRooms} floor="1.sal" />
      )}
      {activeTab === "hele_huset" && <WholeHouseView />}
    </div>
  );
}

interface FloorViewProps {
  rooms: Room[];
  floor: keyof typeof FLOOR_CONFIG;
}

function FloorView({ rooms, floor }: FloorViewProps) {
  const config = FLOOR_CONFIG[floor];

  return (
    <>
      <div>
        <h2 className="heading text-3xl font-bold text-text-primary mb-2">
          {config.title}
        </h2>
        <p className="text-text-secondary max-w-2xl">{config.description}</p>
      </div>

      {config.hasFloorPlan ? (
        <div>
          <h3 className="heading text-xl font-semibold text-text-primary mb-3">
            Plantegning — {config.title}
          </h3>
          <FloorPlan rooms={rooms} />
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-text-muted text-sm mb-1">Plantegning</p>
          <p className="text-text-secondary">
            Vi mangler plantegning for {config.title} — den tilføjes når den er
            klar.
          </p>
        </div>
      )}

      <div>
        <h3 className="heading text-xl font-semibold text-text-primary mb-3">
          Alle rum
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
    </>
  );
}

function WholeHouseView() {
  return (
    <>
      <div>
        <h2 className="heading text-3xl font-bold text-text-primary mb-2">
          Hele huset
        </h2>
        <p className="text-text-secondary max-w-2xl">
          Overordnede initiativer og spørgsmål der rammer på tværs af kælder og
          første sal.
        </p>
      </div>

      {data.crossCuttingInitiatives.length > 0 && (
        <div>
          <h3 className="heading text-xl font-semibold text-text-primary mb-3">
            Tværgående initiativer
          </h3>
          <div className="card divide-y divide-border-light">
            {data.crossCuttingInitiatives.map((init, idx) => (
              <div key={idx} className="px-5 py-3.5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-coral shrink-0" />
                <span className="text-sm text-text-primary">
                  {init.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.crossCuttingQuestions.length > 0 && (
        <div>
          <h3 className="heading text-xl font-semibold text-text-primary mb-3">
            Ubesvarede spørgsmål
          </h3>
          <div className="space-y-3">
            {data.crossCuttingQuestions.map((q, idx) => (
              <QuestionCard key={idx} question={q} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
