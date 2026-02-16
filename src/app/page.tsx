"use client";

import { useState } from "react";
import { Tabs, PasientTab, BehandlerTab, IkkePlanlagtTab, OptimeringPanel } from "@/components";

const tabs = [
  { id: "pasient", label: "Pasient" },
  { id: "behandler", label: "Behandler" },
  { id: "ikke-planlagt", label: "Ikke-planlagt" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("pasient");

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-zinc-900 dark:text-white">
          Vikersund Bad
        </h1>

        <OptimeringPanel />

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
          {activeTab === "pasient" && <PasientTab />}
          {activeTab === "behandler" && <BehandlerTab />}
          {activeTab === "ikke-planlagt" && <IkkePlanlagtTab />}
        </div>
      </div>
    </div>
  );
}
