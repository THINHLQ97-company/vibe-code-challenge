import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { listPublishedByBoard } from "@/lib/db/queries/submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const session = await getSession();
  const me = session ? await db.query.users.findFirst({ where: eq(users.id, session.userId) }) : null;
  const board = me?.board ?? "van_phong";
  const rows = await listPublishedByBoard(board);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Bảng xếp hạng — {board === "ky_thuat" ? "Bảng Kỹ thuật" : "Bảng Văn phòng"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState icon="🏆" title="Chưa có bài nào được công bố" desc="Khi BTC công bố kết quả, bảng xếp hạng của bảng bạn sẽ hiện ở đây." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Thí sinh</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-right">Điểm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={r.id} className={r.userName === me?.name ? "bg-cream-100" : ""}>
                  <TableCell>{MEDALS[i] ?? i + 1}</TableCell>
                  <TableCell>{r.userName === me?.name ? <b>Bạn</b> : r.userName}</TableCell>
                  <TableCell>{r.productName}</TableCell>
                  <TableCell className="text-right font-bold">{r.finalScore}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
