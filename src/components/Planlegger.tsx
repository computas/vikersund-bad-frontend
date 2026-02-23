"use client";

import { useState, useEffect } from "react";
import { useOptimering } from "@/hooks/useOptimering";
import { StepIndicator } from "./StepIndicator";
import { InputdataStep } from "./InputdataStep";
import { GruppeKalenderStep } from "./GruppeKalenderStep";
import { OptimeringStep } from "./OptimeringStep";
import { ResultaterStep } from "./ResultaterStep";

const STEPS = [
  { number: 1, label: "Inputdata" },
  { number: 2, label: "Gruppekalender" },
  { number: 3, label: "Optimering" },
  { number: 4, label: "Resultater" },
];

export function Planlegger() {
  const [currentStep, setCurrentStep] = useState(0);
  const { status } = useOptimering();

  useEffect(() => {
    if (currentStep === 3 && !status?.harResultat) {
      setCurrentStep(2);
    }
  }, [currentStep, status?.harResultat]);

  const isStepDisabled = (index: number) => {
    return index === 3 && !status?.harResultat;
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        {/* Header */}
        <h1 className="mb-1 text-3xl font-bold text-zinc-900 dark:text-white">
          Vikersund Bad
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Timeplanlegging for rehabiliteringsopphold
        </p>

        {/* Tab navigation */}
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          isStepDisabled={isStepDisabled}
        />

        {/* Content */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-800">
          {/* Navigation arrows */}
          <div className="mb-4 flex items-center justify-between">
            {currentStep > 0 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                {STEPS[currentStep - 1].label}
              </button>
            ) : <span />}
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => !isStepDisabled(currentStep + 1) && setCurrentStep(currentStep + 1)}
                disabled={isStepDisabled(currentStep + 1)}
                className={`flex items-center gap-1.5 text-sm font-medium ${
                  isStepDisabled(currentStep + 1)
                    ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {STEPS[currentStep + 1].label}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </button>
            ) : <span />}
          </div>

          {currentStep === 0 && <InputdataStep />}
          {currentStep === 1 && <GruppeKalenderStep />}
          {currentStep === 2 && <OptimeringStep />}
          {currentStep === 3 && <ResultaterStep />}
        </div>
      </div>
    </div>
  );
}
