"use client";

import { useRouter } from "next/navigation";
import { SegmentedControl } from "@/components/dsvh/ui/SegmentedControl";

export type WaveTab = { id: number; name: string; phase3: number; hasWindow: boolean };

/**
 * Thanh chọn đợt, có kèm SỐ BÀI ĐANG CHỜ của từng đợt.
 *
 * Bản đầu chỉ ghi tên đợt, nên một đợt có người chờ xếp lịch trông y hệt một đợt rỗng — ban tổ
 * chức phải bấm thử từng đợt mới biết người của mình nằm ở đâu. Dấu chấm cảnh báo cho đợt có
 * người nhưng chưa khai cửa sổ đăng bài: đó là trường hợp hệ thống không thể tự xử lý.
 */
export function WaveTabs({
  waves,
  selectedWaveId,
}: {
  waves: WaveTab[];
  selectedWaveId: number;
}) {
  const router = useRouter();
  if (waves.length <= 1) return null;

  return (
    <div className="mb-3">
      <SegmentedControl
        options={waves.map((w) => ({
          value: String(w.id),
          label:
            w.phase3 > 0
              ? `${w.name} (${w.phase3}${w.hasWindow ? "" : " ⚠"})`
              : w.name,
        }))}
        value={String(selectedWaveId)}
        onChange={(v) => router.push(`/admin/posting-schedule?wave=${v}`)}
        size="sm"
      />
    </div>
  );
}
