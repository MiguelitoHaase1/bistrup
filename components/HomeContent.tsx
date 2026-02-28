"use client";

import { useState } from "react";
import FloorPlan from "@/components/FloorPlan";
import RoomCard from "@/components/RoomCard";
import ProgressBar from "@/components/ProgressBar";
import FloorTabs, { type Tab } from "@/components/FloorTabs";
import { data } from "@/lib/data";
import { getAggregateStats } from "@/lib/room-stats";

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<Tab>("kælder");

  const basementRooms = data.rooms.filter((r) => r.floor === "kælder");
  const upstairsRooms = data.rooms.filter((r) => r.floor === "1.sal");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <FloorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "kælder" && <BasementView rooms={basementRooms} />}
      {activeTab === "1.sal" && <UpstairsView rooms={upstairsRooms} />}
      {activeTab === "hele_huset" && <WholeHouseView />}
    </div>
  );
}

function BasementView({ rooms }: { rooms: typeof data.rooms }) {
  const stats = getAggregateStats(rooms);

  return (
    <>
      <div>
        <h2 className="heading text-3xl font-bold text-text-primary mb-2">
          Kælder
        </h2>
        <p className="text-text-secondary max-w-2xl">
          I kælderen er der, hvor de store forandringer sker. Klik på et rum i
          plantegningen eller i listen nedenfor.
        </p>
      </div>

      <StatsRow stats={stats} roomCount={rooms.length} />

      <div>
        <h3 className="heading text-xl font-semibold text-text-primary mb-3">
          Plantegning — Kælder
        </h3>
        <FloorPlan rooms={rooms} />
      </div>

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

function UpstairsView({ rooms }: { rooms: typeof data.rooms }) {
  const stats = getAggregateStats(rooms);

  return (
    <>
      <div>
        <h2 className="heading text-3xl font-bold text-text-primary mb-2">
          1. sal
        </h2>
        <p className="text-text-secondary max-w-2xl">
          På første sal handler det om at kombinere de to små badeværelser til ét
          større, og gøre soveværelserne mere behagelige.
        </p>
      </div>

      <StatsRow stats={stats} roomCount={rooms.length} />

      <div className="card p-8 text-center">
        <p className="text-text-muted text-sm mb-1">Plantegning</p>
        <p className="text-text-secondary">
          Vi mangler plantegning for 1. sal — den tilføjes når den er klar.
        </p>
      </div>

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

      {(data.crossCuttingInitiatives.length > 0 || data.crossCuttingQuestions.length > 0) && (
        <div>
          <h3 className="heading text-xl font-semibold text-text-primary mb-3">
            Tværgående initiativer
          </h3>
          <div className="card divide-y divide-border-light">
            {data.crossCuttingInitiatives.map((init, idx) => (
              <div key={idx} className="px-5 py-3.5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-coral shrink-0" />
                <span className="text-sm text-text-primary">{init.description}</span>
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
              <div
                key={idx}
                className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3"
              >
                <span className="mt-0.5 text-status-progress text-lg">?</span>
                <div>
                  <p className="text-sm text-text-primary">{q.question}</p>
                  <span className="text-xs text-text-muted mt-1 block">{q.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatsRow({ stats, roomCount }: { stats: ReturnType<typeof getAggregateStats>; roomCount: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="card p-5">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Rum</p>
        <p className="text-2xl font-bold text-text-primary">{roomCount}</p>
      </div>
      <div className="card p-5">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Initiativer</p>
        <ProgressBar done={stats.done} inProgress={stats.inProgress} total={stats.total} />
      </div>
      <div className="card p-5">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Ubesvarede spørgsmål</p>
        <p className="text-2xl font-bold text-status-progress">{stats.unresolvedQuestions}</p>
      </div>
    </div>
  );
}
