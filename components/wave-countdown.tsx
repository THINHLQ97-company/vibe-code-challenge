"use client";

import { useEffect, useState } from "react";

/**
 * Đồng hồ đếm ngược cho đợt thi.
 *
 * Là component CLIENT vì nó phải tự chạy mỗi giây. Mốc thời gian truyền vào dạng chuỗi ISO do máy
 * chủ tính, không để trình duyệt tự suy — đồng hồ máy người dùng lệch thì con số vẫn đúng theo mốc
 * thật, chỉ sai đúng phần lệch đó.
 *
 * Lần dựng ĐẦU TIÊN cố ý trả ra khung rỗng, chỉ sau khi gắn vào trang mới hiện số: máy chủ và
 * trình duyệt luôn cách nhau vài trăm mili giây, mà React so kết quả dựng hai bên — chênh một
 * giây là lỗi hydration đỏ cả console.
 */
function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function WaveCountdown({ to, tone = "accent" }: { to: string; tone?: "accent" | "muted" }) {
  const target = new Date(to).getTime();
  const [t, setT] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setT(diff(target));
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const cells: Array<[number | null, string]> = [
    [t?.days ?? null, "ngày"],
    [t?.hours ?? null, "giờ"],
    [t?.minutes ?? null, "phút"],
    [t?.seconds ?? null, "giây"],
  ];

  const box =
    tone === "accent"
      ? "border-orange/30 bg-orange/12 text-orange-bright"
      : "border-cream/15 bg-cream/5 text-cream/80";

  return (
    <div className="flex gap-2" role="timer" aria-live="off">
      {cells.map(([v, label]) => (
        <div key={label} className={`min-w-14 rounded-lg border px-2.5 py-1.5 text-center ${box}`}>
          <div className="text-title font-bold tabular-nums leading-tight">
            {v === null ? "--" : String(v).padStart(2, "0")}
          </div>
          <div className="text-meta text-cream/50">{label}</div>
        </div>
      ))}
    </div>
  );
}
