"use client";

import { useMemo, useRef, useState } from "react";
import { FloatingLayer } from "@/components/dsvh/ui/overlay/FloatingLayer";
import { GitHubIcon, GitLabIcon } from "@/components/dsvh/brand-icons";
import {
  CheckIcon,
  ChevronDownIcon,
  GitBranchIcon,
  LockIcon,
  SearchIcon,
} from "@/components/dsvh/icons";

export type RepoProvider = "github" | "gitlab";

export interface Repo {
  id: string;
  name: string;
  provider: RepoProvider;
  private?: boolean;
  updated?: string;
}

export interface RepoPickerProps {
  repos: Repo[];
  value?: string;
  onChange?: (id: string) => void;
  searchable?: boolean;
}

function ProviderIcon({ provider }: { provider: RepoProvider }) {
  return provider === "gitlab" ? (
    <GitLabIcon size={18} />
  ) : (
    <GitHubIcon size={18} />
  );
}

/**
 * Chọn repository để import/deploy (kiểu Vercel/Netlify): mỗi dòng có icon
 * provider + tên + badge private + thời gian cập nhật; dòng chọn tô cam. Có ô
 * tìm nhanh. Chỉ semantic token, theme-aware.
 */
export function RepoPicker({
  repos,
  value,
  onChange,
  searchable = true,
}: RepoPickerProps) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? repos.filter((r) => r.name.toLowerCase().includes(s)) : repos;
  }, [q, repos]);

  return (
    <div className="flex flex-col gap-2.5">
      {searchable && (
        <div className="flex h-9 items-center gap-2 rounded-lg border border-stroke bg-surface px-3">
          <SearchIcon width={16} height={16} className="shrink-0 text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm repository…"
            aria-label="Tìm repository"
            className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-3"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((r) => {
          const selected = r.id === value;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange?.(r.id)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                selected
                  ? "border-orange bg-orange/[0.06] ring-1 ring-orange/25"
                  : "border-stroke bg-surface hover:border-stroke-hover hover:bg-stroke-soft"
              }`}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-stroke bg-surface text-ink">
                <ProviderIcon provider={r.provider} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-body font-semibold text-ink">
                    {r.name}
                  </span>
                  {r.private && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-meta font-medium text-ink-3">
                      <LockIcon width={11} height={11} />
                      Private
                    </span>
                  )}
                </span>
                {r.updated && (
                  <span className="mt-0.5 block text-caption text-ink-3">
                    Cập nhật {r.updated}
                  </span>
                )}
              </span>
              {selected && (
                <CheckIcon width={18} height={18} className="shrink-0 text-orange" />
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-1 py-4 text-center text-caption text-ink-3">
            Không có repo nào khớp “{q}”.
          </p>
        )}
      </div>
    </div>
  );
}

export interface BranchPickerProps {
  branches: string[];
  value?: string;
  onChange?: (branch: string) => void;
  defaultBranch?: string;
}

/**
 * Chọn nhánh git — nút gọn (icon branch + tên + caret) mở dropdown qua
 * [FloatingLayer] (né mép, không bị overflow cắt). Nhánh mặc định có badge.
 */
export function BranchPicker({
  branches,
  value,
  onChange,
  defaultBranch,
}: BranchPickerProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const current = value ?? branches[0];

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-stroke bg-surface px-3 text-body text-ink outline-none transition-colors hover:border-stroke-hover focus-visible:ring-2 focus-visible:ring-orange/30"
      >
        <GitBranchIcon width={16} height={16} className="text-ink-3" />
        <span className="font-medium">{current}</span>
        <ChevronDownIcon width={14} height={14} className="text-ink-3" />
      </button>

      <FloatingLayer
        anchorRef={anchorRef}
        open={open}
        onClose={() => setOpen(false)}
        side="bottom"
        align="start"
        gap={6}
        role="listbox"
        className="min-w-[200px] rounded-xl border border-stroke bg-surface p-1 shadow-[0_16px_44px_-16px_rgba(10,13,20,0.24)]"
      >
        {branches.map((b) => {
          const selected = b === current;
          return (
            <button
              key={b}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => {
                onChange?.(b);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-body transition-colors ${
                selected ? "bg-stroke-soft text-ink" : "text-ink-2 hover:bg-stroke-soft hover:text-ink"
              }`}
            >
              <GitBranchIcon width={15} height={15} className="shrink-0 text-ink-3" />
              <span className="flex-1 truncate font-medium">{b}</span>
              {b === defaultBranch && (
                <span className="rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-meta font-medium text-ink-3">
                  default
                </span>
              )}
              {selected && <CheckIcon width={15} height={15} className="shrink-0 text-orange" />}
            </button>
          );
        })}
      </FloatingLayer>
    </>
  );
}
