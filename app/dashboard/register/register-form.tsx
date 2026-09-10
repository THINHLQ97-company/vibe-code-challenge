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
import { UploadSimpleIcon, FileTextIcon } from "@/components/dsvh/icons";

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

type Initial = {
  productName: string;
  branch: "A" | "B";
  topicGroup: string;
  problemDesc: string;
  targetUsers: string;
  features: unknown;
  databasePlan: string;
  hasWorkflow: boolean;
  workflowDesc: string | null;
  deployMethod: string;
  aiTool: string | null;
  googleAiPro: boolean;
  dataUsed: string | null;
  riskSelfAssessment: string | null;
  requestedDeadlineDays: number;
  prdContent: string | null;
  prdFileName: string | null;
};

/** Chỉ nhận định dạng chữ thuần — hệ chấm ngoài phải đọc được nội dung mới chấm được Phase 1. */
const PRD_ACCEPT = ".md,.markdown,.txt,text/markdown,text/plain";
const PRD_MAX_BYTES = 200_000;

export function RegisterForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [productName, setProductName] = useState(initial?.productName ?? "");
  const [branch, setBranch] = useState<string | null>(initial?.branch ?? "A");
  const [topicGroup, setTopicGroup] = useState<string | null>(initial?.topicGroup ?? null);
  const [problemDesc, setProblemDesc] = useState(initial?.problemDesc ?? "");
  const [targetUsers, setTargetUsers] = useState(initial?.targetUsers ?? "");
  const [featuresText, setFeaturesText] = useState(
    Array.isArray(initial?.features) ? (initial!.features as string[]).join("\n") : ""
  );
  const [databasePlan, setDatabasePlan] = useState(initial?.databasePlan ?? "");
  const [hasWorkflow, setHasWorkflow] = useState(initial?.hasWorkflow ?? false);
  const [workflowDesc, setWorkflowDesc] = useState(initial?.workflowDesc ?? "");
  const [aiTool, setAiTool] = useState(initial?.aiTool ?? "");
  const [googleAiPro, setGoogleAiPro] = useState(initial?.googleAiPro ?? true);
  const [dataUsed, setDataUsed] = useState(initial?.dataUsed ?? "");
  const [riskSelfAssessment, setRiskSelfAssessment] = useState(initial?.riskSelfAssessment ?? "");
  const [requestedDeadlineDays, setRequestedDeadlineDays] = useState(
    initial?.requestedDeadlineDays ?? 15
  );
  const [prdContent, setPrdContent] = useState(initial?.prdContent ?? "");
  const [prdFileName, setPrdFileName] = useState(initial?.prdFileName ?? "");
  const [prdError, setPrdError] = useState<string | null>(null);
  const [confirmFakeData, setConfirmFakeData] = useState(false);
  const [confirmNoMatbaoInfo, setConfirmNoMatbaoInfo] = useState(false);
  const [confirmTemplateConsent, setConfirmTemplateConsent] = useState(false);
  const [confirmSelfBuilt, setConfirmSelfBuilt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    if (features.length < 3) {
      setError("Liệt kê tối thiểu 3 chức năng — đây là căn cứ chấm ngưỡng sàn.");
      return;
    }
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
          features,
          prdContent,
          prdFileName: prdFileName || undefined,
          databasePlan,
          hasWorkflow,
          workflowDesc: hasWorkflow ? workflowDesc : undefined,
          deployMethod: DEPLOY_METHOD,
          aiTool,
          googleAiPro,
          dataUsed,
          riskSelfAssessment,
          requestedDeadlineDays,
          confirmFakeData,
          confirmNoMatbaoInfo,
          confirmTemplateConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gửi đăng ký thất bại");
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
        <CardHeader title="Đề tài" subtitle="Phần này là căn cứ để BTC duyệt và để chấm điểm ý tưởng" />
        <div className="space-y-4">
          <Input
            label="Tên sản phẩm dự kiến"
            placeholder="VD: Sổ thu chi cá nhân"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Nhánh đề tài" options={BRANCHES} value={branch} onChange={setBranch} />
            <Select
              label="Nhóm chủ đề"
              placeholder="— Chọn nhóm —"
              options={TOPIC_GROUPS}
              value={topicGroup}
              onChange={setTopicGroup}
            />
          </div>
          <Textarea
            label="Bài toán đang giải là gì"
            hint="3–5 câu: ai gặp, bao nhiêu lần/tuần, đang xử lý ra sao, mất bao lâu"
            value={problemDesc}
            onChange={(e) => setProblemDesc(e.target.value)}
            required
          />
          <Textarea
            label="Người dùng của sản phẩm"
            hint="Nhánh B thì ghi rõ là chính mình + ước lượng còn bao nhiêu người gặp đúng bài toán"
            value={targetUsers}
            onChange={(e) => setTargetUsers(e.target.value)}
            required
          />
          <Textarea
            label="Chức năng chính"
            hint="Mỗi dòng một chức năng, tối thiểu 3 — ba chức năng đầu dùng để chấm ngưỡng sàn"
            placeholder={"Ghi nhận thu/chi theo ngày\nXem biểu đồ theo tháng\nXuất báo cáo PDF"}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            required
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Tài liệu PRD"
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
            Hệ chấm điểm đọc thẳng nội dung này nên chỉ nhận chữ (.md / .txt), không nhận .docx hay
            .pdf. Đừng dán dữ liệu khách thật hay thông tin nội bộ vào đây.
          </Note>
        </div>
      </Card>

      <Card>
        <CardHeader title="Kỹ thuật & an toàn" subtitle="Sản phẩm bắt buộc có database chạy thật" />
        <div className="space-y-4">
          <Textarea
            label="Database sẽ dùng"
            hint="Loại dữ liệu lưu và dùng để làm gì trong sản phẩm"
            value={databasePlan}
            onChange={(e) => setDatabasePlan(e.target.value)}
            required
          />
          <Checkbox
            checked={hasWorkflow}
            onChange={setHasWorkflow}
            label="Có workflow tự động chạy (cron / tự động gửi / xử lý nền) — cộng điểm chất lượng"
          />
          {hasWorkflow && (
            <Textarea
              label="Mô tả workflow"
              value={workflowDesc}
              onChange={(e) => setWorkflowDesc(e.target.value)}
            />
          )}
          <Input
            label="Hạn nộp mong muốn (ngày kể từ khi duyệt)"
            type="number"
            min={1}
            max={15}
            value={String(requestedDeadlineDays)}
            onChange={(e) => setRequestedDeadlineDays(Number(e.target.value))}
            className="sm:max-w-xs"
          />
          <Note tone="warning">
            Sản phẩm phải được <b>tự dựng mới trong kỳ thi</b>. Bài bị phát hiện dùng lại repo hoặc
            mẫu có sẵn sẽ không qua được Phase 2 — BTC đối chiếu lịch sử commit khi chấm mã nguồn.
          </Note>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Công cụ AI dự định dùng"
              placeholder="VD: Google AI Pro / Claude / Cursor"
              value={aiTool}
              onChange={(e) => setAiTool(e.target.value)}
            />
            <div className="flex items-end pb-2">
              <Checkbox
                checked={googleAiPro}
                onChange={setGoogleAiPro}
                label="Có đăng ký Google AI Pro (điều kiện được hoàn phí khi đậu)"
              />
            </div>
          </div>
          <Textarea
            label="Dữ liệu sản phẩm sẽ dùng"
            hint="Liệt kê từng loại — chỉ được dùng dữ liệu giả"
            value={dataUsed}
            onChange={(e) => setDataUsed(e.target.value)}
          />
          <Textarea
            label="Tự đánh giá rủi ro"
            hint="Có chạm dữ liệu khách thật / thông tin nội bộ / bảng giá chưa công bố / thương hiệu Mắt Bão không?"
            value={riskSelfAssessment}
            onChange={(e) => setRiskSelfAssessment(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Cam kết bắt buộc" subtitle="Thiếu một mục là không gửi được đăng ký" />
        <div className="space-y-3">
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
