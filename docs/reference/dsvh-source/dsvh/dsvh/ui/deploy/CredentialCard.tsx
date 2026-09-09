"use client";

import type { ReactNode } from "react";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { SecretInput } from "@/components/dsvh/ui/form/SecretInput";
import { CopyButton } from "@/components/dsvh/ui/CopyButton";

export interface CredentialField {
  label: string;
  value: string;
  /** Che giá trị (mật khẩu, secret) — dùng SecretInput. */
  secret?: boolean;
}

export interface CredentialCardProps {
  title?: string;
  /** Connection string đầy đủ — hiện qua SecretInput (che + sao chép). */
  connectionString?: string;
  /** Các trường host/port/user/password/database… */
  fields?: CredentialField[];
  action?: ReactNode;
}

/**
 * Thẻ thông tin kết nối database: connection string (SecretInput che + copy) +
 * lưới field host/port/user/password (mỗi field có CopyButton, field secret dùng
 * SecretInput). Ghép trực tiếp Card + SecretInput + CopyButton. Chỉ semantic token.
 */
export function CredentialCard({
  title = "Thông tin kết nối",
  connectionString,
  fields = [],
  action,
}: CredentialCardProps) {
  return (
    <Card>
      <CardHeader title={title} action={action} />
      <div className="mt-4 flex flex-col gap-4">
        {connectionString && (
          <div className="flex flex-col gap-1.5">
            <span className="text-caption font-medium text-ink-2">Connection string</span>
            <SecretInput value={connectionString} readOnly />
          </div>
        )}
        {fields.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.label}
                className={`flex min-w-0 flex-col gap-1 ${f.secret ? "sm:col-span-2" : ""}`}
              >
                <span className="text-caption text-ink-3">{f.label}</span>
                {f.secret ? (
                  <SecretInput value={f.value} readOnly />
                ) : (
                  <div className="relative">
                    <div className="flex h-9 w-full items-center rounded-lg border border-stroke bg-surface-2 pl-3 pr-10">
                      <span className="truncate tabular-nums text-caption text-ink">
                        {f.value}
                      </span>
                    </div>
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <CopyButton value={f.value} size="sm" />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
