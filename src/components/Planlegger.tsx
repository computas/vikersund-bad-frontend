"use client";

import { useState } from "react";
import { useOptimering } from "@/hooks/useOptimering";
import { StepIndicator } from "./StepIndicator";
import { InputdataStep } from "./InputdataStep";
import { GruppeKalenderStep } from "./GruppeKalenderStep";
import { OptimeringStep } from "./OptimeringStep";
import { ResultaterStep } from "./ResultaterStep";
import { getMondayOfWeek } from "./WeekCalendar";

const STEPS = [
  { number: 1, label: "Inputdata" },
  { number: 2, label: "Gruppekalender" },
  { number: 3, label: "Optimering" },
  { number: 4, label: "Resultater" },
];

const MANEDER = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function Planlegger() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMonday, setSelectedMonday] = useState(() => getMondayOfWeek(new Date()));
  const { status } = useOptimering();

  const activeStep = currentStep === 3 && !status?.harResultat ? 2 : currentStep;

  const isStepDisabled = (index: number) => {
    return index === 3 && !status?.harResultat;
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-white">
              Vikersund Bad
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Timeplanlegging for rehabiliteringsopphold
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const prev = new Date(selectedMonday);
                prev.setDate(prev.getDate() - 7);
                setSelectedMonday(prev);
              }}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              &larr;
            </button>
            <div className="text-center">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                Uke {getWeekNumber(selectedMonday)}
              </span>
              <span className="ml-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {MANEDER[selectedMonday.getMonth()]} {selectedMonday.getFullYear()}
              </span>
            </div>
            <button
              onClick={() => {
                const next = new Date(selectedMonday);
                next.setDate(next.getDate() + 7);
                setSelectedMonday(next);
              }}
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              &rarr;
            </button>
            <button
              onClick={() => setSelectedMonday(getMondayOfWeek(new Date()))}
              className="ml-1 rounded-md bg-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
            >
              I dag
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <StepIndicator
          steps={STEPS}
          currentStep={activeStep}
          onStepClick={setCurrentStep}
          isStepDisabled={isStepDisabled}
        />

        {/* Content */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
          {/* Navigation arrows */}
          <div className="mb-4 flex items-center justify-between">
            {activeStep > 0 ? (
              <button
                onClick={() => setCurrentStep(activeStep - 1)}
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                {STEPS[activeStep - 1].label}
              </button>
            ) : <span />}
            {activeStep < STEPS.length - 1 ? (
              <button
                onClick={() => !isStepDisabled(activeStep + 1) && setCurrentStep(activeStep + 1)}
                disabled={isStepDisabled(activeStep + 1)}
                className={`flex items-center gap-1.5 text-sm font-medium ${
                  isStepDisabled(activeStep + 1)
                    ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {STEPS[activeStep + 1].label}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </button>
            ) : <span />}
          </div>

          {activeStep === 0 && <InputdataStep />}
          {activeStep === 1 && <GruppeKalenderStep selectedMonday={selectedMonday} onWeekChange={setSelectedMonday} />}
          {activeStep === 2 && <OptimeringStep selectedMonday={selectedMonday} />}
          {activeStep === 3 && <ResultaterStep selectedMonday={selectedMonday} onWeekChange={setSelectedMonday} />}
        </div>
      </div>
    </div>
  );
}
