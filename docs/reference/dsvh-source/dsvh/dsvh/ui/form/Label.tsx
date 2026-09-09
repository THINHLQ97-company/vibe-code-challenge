import type { LabelHTMLAttributes, ReactNode } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Label({
  htmlFor,
  required = false,
  children,
  className = "",
  ...props
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`inline-flex items-center gap-1 text-caption font-medium text-ink-2 select-none ${className}`}
      {...props}
    >
      {children}
      {required && (
        <span className="font-bold text-orange" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
