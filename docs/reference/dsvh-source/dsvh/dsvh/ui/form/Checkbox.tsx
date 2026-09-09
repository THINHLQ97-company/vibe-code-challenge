"use client";

import { useId, type ReactNode, type ChangeEvent } from "react";
import { tv } from "../../tv";
import { CheckIcon, MinusIcon } from "@/components/dsvh/icons";

export type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: ReactNode;
  size?: CheckboxSize;
  className?: string;
  id?: string;
  name?: string;
}

export const checkboxBoxVariants = tv({
  base: "flex shrink-0 items-center justify-center border transition-colors outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-orange/30",
  variants: {
    size: {
      sm: "w-4 h-4 rounded-md",
      md: "w-5 h-5 rounded-md",
      lg: "w-6 h-6 rounded-lg",
    },
    active: {
      true: "bg-orange border-orange text-surface",
      false: "bg-surface border-stroke hover:border-stroke-soft text-transparent",
    },
    disabled: {
      true: "cursor-not-allowed opacity-50 bg-surface-2",
      false: "cursor-pointer",
    },
  },
  defaultVariants: {
    size: "md",
    active: false,
    disabled: false,
  },
});

export function Checkbox({
  checked = false,
  onChange,
  indeterminate = false,
  disabled = false,
  label,
  size = "md",
  className = "",
  id,
  name,
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const isActive = checked || indeterminate;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange?.(e.target.checked);
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <label
      htmlFor={checkboxId}
      className={`inline-flex items-center gap-2.5 select-none ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="peer sr-only"
        />
        <div
          className={checkboxBoxVariants({
            size,
            active: isActive,
            disabled,
          })}
        >
          {indeterminate ? (
            <MinusIcon size={iconSizes[size]} className="text-surface" />
          ) : checked ? (
            <CheckIcon size={iconSizes[size]} className="text-surface" />
          ) : null}
        </div>
      </div>
      {label && (
        <span
          className={`text-ink ${
            size === "sm"
              ? "text-caption"
              : size === "lg"
              ? "text-body"
              : "text-body"
          }`}
        >
          {label}
        </span>
      )}
    </label>
  );
}
