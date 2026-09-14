import { PageShell } from "@/components/dsvh/ui/layout/PageShell";
import { Note } from "@/components/dsvh/ui/data/Note";
import { getActiveSeason } from "@/lib/db/queries/seasons";
import { listWaves, countByWave } from "@/lib/db/queries/waves";
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

  const [waves, counts] = await Promise.all([listWaves(season.id), countByWave(season.id)]);
  const rows: WaveRow[] = waves.map((w) => ({
    id: w.id,
    name: w.name,
    orderIndex: w.orderIndex,
    registrationOpensAt: w.registrationOpensAt.toISOString(),
    registrationClosesAt: w.registrationClosesAt.toISOString(),
    capacity: w.capacity,
    bonusPoints: w.bonusPoints,
    status: w.status,
    registered: counts.get(w.id) ?? 0,
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
