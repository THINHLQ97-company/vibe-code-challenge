"use client";

import { useId, type ReactNode } from "react";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  options: RadioOption[];
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({
  value,
  onChange,
  name,
  options,
  disabled = false,
  className = "",
}: RadioGroupProps) {
  const generatedName = useId();
  const radioName = name || generatedName;

  return (
    <div
      role="radiogroup"
      className={`flex flex-col gap-2.5 ${className}`}
    >
      {options.map((option) => {
        const isChecked = option.value === value;
        const isDisabled = disabled || option.disabled;
        const optionId = `${radioName}-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={optionId}
            className={`inline-flex items-center gap-2.5 select-none ${
              isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                id={optionId}
                name={radioName}
                value={option.value}
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => !isDisabled && onChange?.(option.value)}
                className="peer sr-only"
              />
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-orange/30 ${
                  isChecked
                    ? "border-orange bg-surface"
                    : "border-stroke bg-surface hover:border-stroke-soft"
                } ${isDisabled ? "bg-surface-2" : ""}`}
              >
                {isChecked && (
                  <span className="h-2.5 w-2.5 rounded-full bg-orange" />
                )}
              </div>
            </div>
            <span className="text-body text-ink">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
