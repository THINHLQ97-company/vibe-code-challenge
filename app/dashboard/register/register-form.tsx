"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/dsvh/ui/Card";
import { Input } from "@/components/dsvh/ui/Input";
import { Textarea } from "@/components/dsvh/ui/form/Textarea";
import { Select } from "@/components/dsvh/ui/form/Select";
import { Checkbox } from "@/components/dsvh/ui/form/Checkbox";
import { Button } from "@/components/dsvh/ui/Button";
import { Alert } from "@/components/dsvh/ui/overlay/Alert";
import { Note } from "@/components/dsvh/ui/data/Note";
import {
  UploadSimpleIcon,
  FileTextIcon,
  NotepadIcon,
  RobotIcon,
  ShieldCheckIcon,
} from "@/components/dsvh/icons";
import { RadioGroup } from "@/components/dsvh/ui/form/RadioGroup";

/**
 * Nhãn có icon cho đầu mỗi nhóm nội dung. Biểu mẫu này dài hơn ba màn hình và bốn thẻ trông hệt
 * nhau — một icon ở đầu mỗi thẻ là mốc để mắt bám khi cuộn, rẻ hơn nhiều so với đọc lại tiêu đề.
 */
function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
        {icon}
      </span>
      {children}
    </span>
  );
}

const TOPIC_GROUPS = [
  "Tài chính cá nhân & DN",
  "Kinh doanh / bán hàng",
  "Marketing / Sales / CSKH",
  "Website / Kỹ thuật",
  "Quản lý / Vận hành",
  "Văn phòng / Nhân sự",
  "Pháp lý",
  "Giáo dục / học tập",
  "Cá nhân / đời sống",
].map((g) => ({ value: g, label: g }));

const BRANCHES = [
  { value: "A", label: "Nhánh A — Công cụ cho người khác dùng" },
  { value: "B", label: "Nhánh B — Giải bài toán của chính mình" },
];

/**
 * Chỉ còn MỘT cách hợp lệ. Thể lệ đã chốt: đây là cuộc thi vibe code, bài bị phát hiện dùng
 * repo/mẫu có sẵn không qua được Phase 2. Trước đây form cho chọn "deploy từ repo có sẵn" rồi chỉ
 * hạ trần điểm kỹ thuật — tức là vẫn hợp lệ, chỉ thiệt điểm. Bỏ hẳn lựa chọn đó.
 */
const DEPLOY_METHOD = "Tự dựng mới trong kỳ thi";

/** Chỉ liệt kê các trường form CÒN thu thập — trường đã ngưng không cần điền lại khi sửa. */
type Initial = {
  productName: string;
  branch: "A" | "B";
  topicGroup: string;
  problemDesc: string;
  targetUsers: string;
  aiTool: string | null;
  prdContent: string | null;
  prdFileName: string | null;
};

/** Chỉ nhận .md — hệ chấm ngoài phải đọc được nội dung mới chấm tự động được Phase 1. */
const PRD_ACCEPT = ".md,.markdown,text/markdown";
const PRD_MAX_BYTES = 200_000;

export function RegisterForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [productName, setProductName] = useState(initial?.productName ?? "");
  const [branch, setBranch] = useState<string | null>(initial?.branch ?? "A");
  const [topicGroup, setTopicGroup] = useState<string | null>(initial?.topicGroup ?? null);
  const [problemDesc, setProblemDesc] = useState(initial?.problemDesc ?? "");
  const [targetUsers, setTargetUsers] = useState(initial?.targetUsers ?? "");
  const [aiTool, setAiTool] = useState(initial?.aiTool ?? "");
  const [prdContent, setPrdContent] = useState(initial?.prdContent ?? "");
  const [prdFileName, setPrdFileName] = useState(initial?.prdFileName ?? "");
  const [prdError, setPrdError] = useState<string | null>(null);
  const [confirmFakeData, setConfirmFakeData] = useState(false);
  const [confirmNoMatbaoInfo, setConfirmNoMatbaoInfo] = useState(false);
  const [confirmTemplateConsent, setConfirmTemplateConsent] = useState(false);
  const [confirmSelfBuilt, setConfirmSelfBuilt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Lỗi gắn với đúng ô nào — máy chủ trả về tên trường cùng câu báo lỗi. */
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    if (!topicGroup) {
      setError("Chọn nhóm chủ đề.");
      return;
    }
    if (prdContent.trim().length < 200) {
      setError("Cần đính tài liệu PRD — đây là căn cứ chấm điểm ý tưởng ở Phase 1.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          branch,
          topicGroup,
          problemDesc,
          targetUsers,
          prdContent,
          prdFileName: prdFileName || undefined,
          deployMethod: DEPLOY_METHOD,
          aiTool,
          confirmFakeData,
          confirmNoMatbaoInfo,
          confirmTemplateConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.field) {
          setFieldError({ field: String(data.field), message: data.error });
          // Cuộn tới đúng ô sai: biểu mẫu này dài hơn một màn hình, đặt câu lỗi đúng chỗ mà không
          // đưa mắt người dùng tới đó thì họ vẫn phải tự dò.
          document
            .querySelector(`[data-field="${data.field}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          setError(data.error ?? "Gửi đăng ký thất bại");
        }
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  async function readPrdFile(file: File | undefined) {
    setPrdError(null);
    if (!file) return;
    if (file.size > PRD_MAX_BYTES) {
      setPrdError("File quá lớn (giới hạn 200 KB chữ). Rút gọn còn phần mô tả sản phẩm.");
      return;
    }
    // Đọc ngay ở trình duyệt rồi gửi NỘI DUNG lên — không upload file nhị phân. Nhờ vậy hệ chấm
    // ngoài đọc được tài liệu qua API, và app không phải nuôi thêm ổ lưu trữ file.
    const text = await file.text();
    if (text.trim().length < 200) {
      setPrdError("Nội dung file quá ngắn để chấm điểm ý tưởng.");
      return;
    }
    setPrdContent(text);
    setPrdFileName(file.name);
  }

  const allConfirmed =
    confirmFakeData && confirmNoMatbaoInfo && confirmTemplateConsent && confirmSelfBuilt;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardHeader
          title={<SectionTitle icon={<NotepadIcon size={16} />}>Đề tài</SectionTitle>}
          subtitle="Phần này là căn cứ để BTC duyệt và để chấm điểm ý tưởng"
        />
        <div className="space-y-4">
          <Input
            data-field="productName"
            label="Tên sản phẩm dự kiến"
            error={fieldError?.field === "productName" ? fieldError.message : undefined}
            placeholder="VD: Sổ thu chi cá nhân"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          {/* Hai lựa chọn thì bày cả hai ra. Dropdown chỉ đáng dùng khi danh sách dài tới mức
              chiếm chỗ — với đúng hai mục, nó bắt người dùng bấm thêm một lần chỉ để đọc được
              thứ lẽ ra nhìn là thấy, và giấu mất chính điều họ cần so sánh để chọn. */}
          <div>
            <p className="mb-1.5 text-caption font-medium text-ink-2">Nhánh đề tài</p>
            <RadioGroup options={BRANCHES} value={branch ?? "A"} onChange={setBranch} />
          </div>
          <Select
            label="Nhóm chủ đề"
            placeholder="— Chọn nhóm —"
            options={TOPIC_GROUPS}
            value={topicGroup}
            onChange={setTopicGroup}
          />
          <Textarea
            data-field="problemDesc"
            label="Bài toán đang giải là gì"
            error={fieldError?.field === "problemDesc" ? fieldError.message : undefined}
            hint="3–5 câu: ai gặp, bao nhiêu lần/tuần, đang xử lý ra sao, mất bao lâu"
            value={problemDesc}
            onChange={(e) => setProblemDesc(e.target.value)}
            required
          />
          <Textarea
            data-field="targetUsers"
            label="Người dùng của sản phẩm"
            error={fieldError?.field === "targetUsers" ? fieldError.message : undefined}
            hint="Nhánh B thì ghi rõ là chính mình + ước lượng còn bao nhiêu người gặp đúng bài toán"
            value={targetUsers}
            onChange={(e) => setTargetUsers(e.target.value)}
            required
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title={<SectionTitle icon={<FileTextIcon size={16} />}>Tài liệu PRD</SectionTitle>}
          subtitle="Phase 1 chấm điểm ý tưởng dựa trên tài liệu này — bắt buộc có"
        />
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stroke bg-surface px-3 py-2 text-caption font-medium text-ink hover:border-stroke-hover hover:bg-surface-hover">
              <UploadSimpleIcon size={16} className="text-ink-2" />
              Chọn file .md
              <input
                type="file"
                accept={PRD_ACCEPT}
                className="sr-only"
                onChange={(e) => void readPrdFile(e.target.files?.[0])}
              />
            </label>
            {prdFileName && (
              <span className="flex items-center gap-1.5 text-caption text-ink-2">
                <FileTextIcon size={15} className="text-ink-3" />
                {prdFileName}
              </span>
            )}
          </div>
          <Textarea
            label="Nội dung PRD (markdown)"
            hint="Nêu bài toán, người dùng, phạm vi, luồng chính, dữ liệu. Chọn file ở trên sẽ tự điền vào đây, và bạn vẫn sửa được."
            value={prdContent}
            onChange={(e) => {
              setPrdContent(e.target.value);
              setPrdError(null);
            }}
            required
          />
          {prdError && <Alert tone="error">{prdError}</Alert>}
          <Note>
            Hệ chấm điểm đọc thẳng nội dung này nên chỉ nhận file .md, không nhận .docx hay
            .pdf. Đừng dán dữ liệu khách thật hay thông tin nội bộ vào đây.
          </Note>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={<SectionTitle icon={<RobotIcon size={16} />}>Thông tin thi</SectionTitle>}
          subtitle="Hạn nộp cố định 15 ngày kể từ khi BTC duyệt đề tài — nộp sớm hơn lúc nào cũng được"
        />
        <div className="space-y-4">
          {/* Bỏ ô "Hạn nộp mong muốn": mọi thí sinh đều có 15 ngày kể từ khi đề tài được duyệt.
              Cho tự chọn ít hơn chỉ tạo ra một quyết định không ai được lợi — nộp sớm lúc nào cũng
              được, và chọn nhầm số nhỏ là tự siết hạn của chính mình. */}
          <Input
            label="Công cụ AI dự định dùng"
            hint="Liệt kê là đủ, không bắt buộc"
            placeholder="VD: Google AI Pro, Claude, Cursor"
            value={aiTool}
            onChange={(e) => setAiTool(e.target.value)}
          />
          <Note tone="warning">
            Sản phẩm phải được <b>tự dựng mới trong kỳ thi</b>. Bài bị phát hiện dùng lại repo hoặc
            mẫu có sẵn sẽ không qua được Phase 2 — ban tổ chức đối chiếu lịch sử commit khi chấm mã
            nguồn.
          </Note>
        </div>
      </Card>

      <Card>
        <CardHeader
          title={<SectionTitle icon={<ShieldCheckIcon size={16} />}>Cam kết bắt buộc</SectionTitle>}
          subtitle="Thiếu một mục là không gửi được đăng ký"
        />
        {/* `space-y` KHÔNG tách được các ô này: `Checkbox` của DSVH render ra `<label>` mang
            `inline-flex`, nên bốn cam kết trôi nối nhau thành một khối chữ liền rất khó đọc.
            `flex flex-col` biến mỗi label thành một phần tử flex — mỗi cam kết một dòng. */}
        <div className="flex flex-col items-start gap-3">
          <Checkbox
            checked={confirmFakeData}
            onChange={setConfirmFakeData}
            label="Xác nhận toàn bộ dữ liệu trong sản phẩm là dữ liệu giả do tôi tự tạo."
          />
          <Checkbox
            checked={confirmNoMatbaoInfo}
            onChange={setConfirmNoMatbaoInfo}
            label="Cam kết không thể hiện thông tin / thương hiệu Mắt Bão trong sản phẩm và bài đăng."
          />
          <Checkbox
            checked={confirmTemplateConsent}
            onChange={setConfirmTemplateConsent}
            label="Đồng ý cho Mắt Bão dùng repo của tôi làm Template Vibe Host (có ghi tên tác giả)."
          />
          <Checkbox
            checked={confirmSelfBuilt}
            onChange={setConfirmSelfBuilt}
            label="Cam kết sản phẩm được tự dựng mới trong kỳ thi, không dùng lại repo hay mẫu có sẵn."
          />
        </div>
      </Card>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex justify-end">
        <Button type="submit" variant="solid" loading={loading} disabled={!allConfirmed}>
          Gửi đăng ký
        </Button>
      </div>
    </form>
  );
}
