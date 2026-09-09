import { Check } from "lucide-react";

/**
 * Phỏng theo Stepper của dsvh (docs/reference/dsvh-source/dsvh/dsvh/ui/Stepper.tsx)
 * — dùng icon SVG lucide (Check) thay vì Phosphor (chưa cài) hoặc ký tự Unicode.
 */
export interface Step {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  current: number; // 0-based, các bước < current coi như đã xong
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function Dot({ state, n }: { state: "done" | "current" | "upcoming"; n: number }) {
  if (state === "done") {
    return (
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-white">
        <Check size={16} strokeWidth={2.5} />
      </span>
    );
  }
  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
        state === "current"
          ? "border-2 border-primary bg-card text-primary"
          : "border border-border bg-card text-subtle"
      }`}
    >
      {n}
    </span>
  );
}

function stateOf(i: number, current: number): "done" | "current" | "upcoming" {
  return i < current ? "done" : i === current ? "current" : "upcoming";
}

export function Stepper({ steps, current, orientation = "horizontal", className = "" }: StepperProps) {
  if (orientation === "vertical") {
    return (
      <ol className={`flex flex-col ${className}`}>
        {steps.map((s, i) => {
          const state = stateOf(i, current);
          const last = i === steps.length - 1;
          return (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <Dot state={state} n={i + 1} />
                {!last && <span className={`w-px flex-1 ${i < current ? "bg-primary" : "bg-border"}`} />}
              </div>
              <div className={`pb-6 ${last ? "pb-0" : ""}`}>
                <p className={`text-base font-semibold ${state === "upcoming" ? "text-subtle" : "text-foreground"}`}>
                  {s.label}
                </p>
                {s.description && <p className="mt-0.5 text-sm text-subtle">{s.description}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className={`flex items-start ${className}`}>
      {steps.map((s, i) => {
        const state = stateOf(i, current);
        const last = i === steps.length - 1;
        return (
          <li key={i} className={`flex items-start ${last ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center text-center">
              <Dot state={state} n={i + 1} />
              <p className={`mt-2 max-w-[9rem] text-sm font-medium ${state === "upcoming" ? "text-subtle" : "text-foreground"}`}>
                {s.label}
              </p>
            </div>
            {!last && <span className={`mt-4 h-px flex-1 ${i < current ? "bg-primary" : "bg-border"}`} />}
          </li>
        );
      })}
    </ol>
  );
}
