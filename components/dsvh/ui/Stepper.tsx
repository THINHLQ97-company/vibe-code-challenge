import { CheckIcon } from "@/components/dsvh/icons";

/**
 * Stepper — chỉ báo tiến trình nhiều bước (luồng deploy, tạo DB…). Bước đã xong
 * = cam + tick; bước hiện tại = viền cam; bước sắp tới = mờ. Ngang hoặc dọc.
 */
export interface Step {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  /** index bước hiện tại (0-based). Các bước < current coi như đã xong. */
  current: number;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

function Dot({ state, n }: { state: "done" | "current" | "upcoming"; n: number }) {
  if (state === "done") {
    return (
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-orange text-white">
        <CheckIcon size={16} />
      </span>
    );
  }
  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-full text-caption font-semibold ${
        state === "current"
          ? "border-2 border-orange bg-surface text-orange"
          : "border border-stroke bg-surface text-ink-3"
      }`}
    >
      {n}
    </span>
  );
}

function stateOf(i: number, current: number): "done" | "current" | "upcoming" {
  return i < current ? "done" : i === current ? "current" : "upcoming";
}

export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  className = "",
}: StepperProps) {
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
                {!last && (
                  <span className={`w-px flex-1 ${i < current ? "bg-orange" : "bg-stroke"}`} />
                )}
              </div>
              <div className={`pb-6 ${last ? "pb-0" : ""}`}>
                <p className={`text-body font-semibold ${state === "upcoming" ? "text-ink-3" : "text-ink"}`}>
                  {s.label}
                </p>
                {s.description && (
                  <p className="mt-0.5 text-caption text-ink-3">{s.description}</p>
                )}
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
              <p className={`mt-2 max-w-[9rem] text-caption font-medium ${state === "upcoming" ? "text-ink-3" : "text-ink"}`}>
                {s.label}
              </p>
            </div>
            {!last && (
              <span className={`mt-4 h-px flex-1 ${i < current ? "bg-orange" : "bg-stroke"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
