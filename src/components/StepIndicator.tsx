"use client";

type Step = {
  number: number;
  label: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: number;
  onStepClick: (index: number) => void;
  isStepDisabled?: (index: number) => boolean;
};

export function StepIndicator({ steps, currentStep, onStepClick, isStepDisabled }: StepIndicatorProps) {
  return (
    <div className="mb-6 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const disabled = isStepDisabled?.(index) ?? false;

        return (
          <button
            key={step.number}
            onClick={() => !disabled && onStepClick(index)}
            disabled={disabled}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white"
                : disabled
                  ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            <span className="mr-1.5 text-xs font-semibold">{step.number}.</span>
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
