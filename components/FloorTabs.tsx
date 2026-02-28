"use client";

import { useState } from "react";
import type { Floor } from "@/lib/types";

type Tab = Floor | "hele_huset";

const TABS: { id: Tab; label: string }[] = [
  { id: "kælder", label: "Kælder" },
  { id: "1.sal", label: "Ovenpå" },
  { id: "hele_huset", label: "Hele huset" },
];

interface FloorTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export type { Tab };

export default function FloorTabs({ activeTab, onTabChange }: FloorTabsProps) {
  return (
    <div className="flex gap-1 bg-cream-dark rounded-lg p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
            activeTab === tab.id
              ? "bg-white text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
