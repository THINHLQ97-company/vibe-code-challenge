"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Button } from "@/components/dsvh/ui/Button";
import { Note } from "@/components/dsvh/ui/data/Note";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/dsvh/icons";

const BAN_LIST = [
  "Dữ liệu khách hàng thật",
  "Khoá API / mật khẩu / chuỗi kết nối trong mã",
  "Thu thập thông tin cá nhân người dùng cuối",
  "Logo / tên miền / hình ảnh thương hiệu Mắt Bão",
  "Tuyên bố là sản phẩm chính thức của Mắt Bão",
  "Lộ việc đang làm tại Mắt Bão",
  "Tài liệu nội bộ / bảng giá chưa công bố",
];

export function BanList() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader
        title="7 điều cấm"
        subtitle="Vi phạm bất kỳ điều nào là chưa qua cổng"
        action={
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={open}
            leftIcon={open ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Thu lại" : "Xem danh sách"}
          </Button>
        }
      />
      {open && (
        <>
          <ol className="list-decimal space-y-1 pl-5 text-caption text-ink-2">
            {BAN_LIST.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ol>
          <Note tone="danger" className="mt-3">
            Vibe Host v2 có cơ chế AI tự sửa mã khi deploy lỗi — mã nguồn được gửi ra nhà cung cấp
            AI nước ngoài. Vì vậy điều cấm 1 và 7 là tuyệt đối, không có ngoại lệ.
          </Note>
        </>
      )}
    </Card>
  );
}
