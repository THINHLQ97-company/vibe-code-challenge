import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Note } from "@/components/dsvh/ui/data/Note";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { listWaves, countInWaveByBoard, listSubmissionsInWave } from "@/lib/db/queries/waves";
import { WavesManager, type WaveRow } from "./waves-manager";

export const metadata = { title: "Đợt thi" };
export const dynamic = "force-dynamic";

export default async function AdminWavesPage() {
  const season = await getActiveSeason();
  if (!season) {
    return (
      <PageShell title="Đợt thi">
        <Note tone="warning">Chưa có mùa thi nào đang mở — tạo mùa thi trước rồi mới chia đợt.</Note>
      </PageShell>
    );
  }

  const waves = await listWaves(season.id);
  const boardCounts = new Map(
    await Promise.all(waves.map(async (w) => [w.id, await countInWaveByBoard(w.id)] as const))
  );
  // Nạp danh sách thí sinh của mọi đợt song song — số đợt chỉ vài cái nên không cần gộp truy vấn.
  const memberLists = await Promise.all(waves.map((w) => listSubmissionsInWave(w.id)));

  const rows: WaveRow[] = waves.map((w, i) => ({
    id: w.id,
    name: w.name,
    orderIndex: w.orderIndex,
    registrationOpensAt: w.registrationOpensAt.toISOString(),
    registrationClosesAt: w.registrationClosesAt.toISOString(),
    capacity: w.capacity,
    capacityKyThuat: w.capacityKyThuat,
    capacityVanPhong: w.capacityVanPhong,
    bonusPoints: w.bonusPoints,
    status: w.status,
    registered: boardCounts.get(w.id)?.total ?? 0,
    registeredKyThuat: boardCounts.get(w.id)?.ky_thuat ?? 0,
    registeredVanPhong: boardCounts.get(w.id)?.van_phong ?? 0,
    members: memberLists[i].map((m) => ({
      submissionId: m.id,
      productName: m.productName,
      userName: m.user.name ?? m.user.email,
      department: m.user.department ?? "—",
      board: m.user.board,
      registrationStatus: m.registrationStatus,
    })),
  }));

  return (
    <PageShell
      title="Đợt thi"
      subtitle="Chia thí sinh theo đợt, đặt lịch mở/đóng đăng ký và điểm thưởng đăng ký sớm"
    >
      <WavesManager initial={rows} />
    </PageShell>
  );
}
