"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, PasientTab, BehandlerTab, IkkePlanlagtTab, OptimeringPanel, GruppeOversikt } from "@/components";
import { useOptimering } from "@/hooks/useOptimering";

export default function Home() {
  const [activeTab, setActiveTab] = useState("pasient");
  const { status, isOptimering, optimeringResultat } = useOptimering();

  const ikkePlanlagtCount = status?.ikkePlanlagt ?? 0;

  const wasOptimering = useRef(false);
  useEffect(() => {
    if (isOptimering) wasOptimering.current = true;
    if (wasOptimering.current && !isOptimering && optimeringResultat) {
      wasOptimering.current = false;
      setActiveTab("pasient");
    }
  }, [isOptimering, optimeringResultat]);

  const tabs = [
    { id: "pasient", label: "Pasient", description: "Velg en pasient for å se ukeplanen med alle gruppe- og individuelle timer." },
    { id: "behandler", label: "Behandler", description: "Velg en behandler for å se alle timene de er tildelt denne uken." },
    { id: "grupper", label: "Grupper", description: "Oversikt over pasientgrupper, faste gruppeaktiviteter og individuelle behandlingsbehov." },
    { id: "ikke-planlagt", label: "Ikke-planlagt", badge: ikkePlanlagtCount, description: "Timer som ikke fikk plass i timeplanen etter optimering." },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-white">
          Vikersund Bad
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Timeplanlegging for rehabiliteringsopphold — se gruppeaktiviteter,
          kjør optimering, og sjekk pasient- og behandlerkalendere.
        </p>

        <OptimeringPanel onNavigateToTab={setActiveTab} />

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
          {activeTab === "pasient" && <PasientTab />}
          {activeTab === "behandler" && <BehandlerTab />}
          {activeTab === "grupper" && <GruppeOversikt />}
          {activeTab === "ikke-planlagt" && <IkkePlanlagtTab />}
        </div>
      </div>
    </div>
  );
}
