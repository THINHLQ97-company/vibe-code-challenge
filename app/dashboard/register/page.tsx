"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
];

const DEPLOY_METHODS = [
  { value: "Tự dựng mới trong kỳ thi", prebuilt: false },
  { value: "Deploy từ Git-repo / mẫu có sẵn trước đó", prebuilt: true },
];

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring md:text-sm";

export default function RegisterPage() {
  const router = useRouter();
  const [productName, setProductName] = useState("");
  const [branch, setBranch] = useState<"A" | "B">("A");
  const [topicGroup, setTopicGroup] = useState("");
  const [problemDesc, setProblemDesc] = useState("");
  const [targetUsers, setTargetUsers] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [databasePlan, setDatabasePlan] = useState("");
  const [hasWorkflow, setHasWorkflow] = useState(false);
  const [workflowDesc, setWorkflowDesc] = useState("");
  const [deployMethod, setDeployMethod] = useState(DEPLOY_METHODS[0].value);
  const [aiTool, setAiTool] = useState("");
  const [googleAiPro, setGoogleAiPro] = useState(true);
  const [dataUsed, setDataUsed] = useState("");
  const [riskSelfAssessment, setRiskSelfAssessment] = useState("");
  const [requestedDeadlineDays, setRequestedDeadlineDays] = useState(15);
  const [confirmFakeData, setConfirmFakeData] = useState(false);
  const [confirmNoMatbaoInfo, setConfirmNoMatbaoInfo] = useState(false);
  const [confirmTemplateConsent, setConfirmTemplateConsent] = useState(false);
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
      setError("Cần liệt kê tối thiểu 3 chức năng (mỗi dòng 1 chức năng)");
      return;
    }
    setLoading(true);
    try {
      const isPrebuiltRepo = DEPLOY_METHODS.find((d) => d.value === deployMethod)?.prebuilt ?? false;
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
          databasePlan,
          hasWorkflow,
          workflowDesc: hasWorkflow ? workflowDesc : undefined,
          deployMethod,
          isPrebuiltRepo,
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
        setError(data.error ?? "Đăng ký thất bại");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📝 Đăng ký đề tài dự thi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="text-caption font-bold uppercase tracking-wide text-teal-strong">
            Đề tài
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="productName">Tên sản phẩm dự kiến</Label>
            <Input
              id="productName"
              placeholder="VD: Sổ thu chi cá nhân"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="branch">Nhánh đề tài</Label>
              <select
                id="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value as "A" | "B")}
                className={selectClass}
              >
                <option value="A">A — Công cụ cho người khác dùng</option>
                <option value="B">B — Giải bài toán của chính mình</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="topicGroup">Nhóm chủ đề</Label>
              <select
                id="topicGroup"
                value={topicGroup}
                onChange={(e) => setTopicGroup(e.target.value)}
                required
                className={selectClass}
              >
                <option value="">— Chọn nhóm —</option>
                {TOPIC_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="problemDesc">Bài toán đang giải (3–5 câu: ai gặp, tần suất, đang xử lý ra sao)</Label>
            <Textarea id="problemDesc" value={problemDesc} onChange={(e) => setProblemDesc(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="targetUsers">Người dùng của sản phẩm</Label>
            <Textarea id="targetUsers" value={targetUsers} onChange={(e) => setTargetUsers(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="features">Chức năng chính (mỗi dòng 1 chức năng, tối thiểu 3)</Label>
            <Textarea
              id="features"
              placeholder={"VD:\nGhi nhận thu/chi theo ngày\nXem biểu đồ theo tháng\nXuất báo cáo PDF"}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              required
            />
          </div>

          <div className="mt-2 text-caption font-bold uppercase tracking-wide text-teal-strong">
            Kỹ thuật & an toàn
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="databasePlan">Database sẽ dùng (loại dữ liệu, dùng để làm gì)</Label>
            <Textarea id="databasePlan" value={databasePlan} onChange={(e) => setDatabasePlan(e.target.value)} required />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="hasWorkflow"
              type="checkbox"
              checked={hasWorkflow}
              onChange={(e) => setHasWorkflow(e.target.checked)}
            />
            <Label htmlFor="hasWorkflow">Có workflow tự động chạy (cron/tự động gửi/xử lý nền)</Label>
          </div>
          {hasWorkflow && (
            <Textarea
              placeholder="Mô tả workflow tự động"
              value={workflowDesc}
              onChange={(e) => setWorkflowDesc(e.target.value)}
            />
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deployMethod">Cách đưa lên Vibe Host</Label>
              <select
                id="deployMethod"
                value={deployMethod}
                onChange={(e) => setDeployMethod(e.target.value)}
                className={selectClass}
              >
                {DEPLOY_METHODS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.value}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="requestedDeadlineDays">Hạn nộp mong muốn (ngày kể từ khi duyệt, tối đa 15)</Label>
              <Input
                id="requestedDeadlineDays"
                type="number"
                min={1}
                max={15}
                value={requestedDeadlineDays}
                onChange={(e) => setRequestedDeadlineDays(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aiTool">Công cụ AI dự định dùng</Label>
              <Input
                id="aiTool"
                placeholder="VD: Google AI Pro / Claude / Cursor"
                value={aiTool}
                onChange={(e) => setAiTool(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input
                id="googleAiPro"
                type="checkbox"
                checked={googleAiPro}
                onChange={(e) => setGoogleAiPro(e.target.checked)}
              />
              <Label htmlFor="googleAiPro">Đăng ký Google AI Pro (để hoàn phí khi đậu)</Label>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dataUsed">Dữ liệu sản phẩm sẽ dùng (liệt kê từng loại)</Label>
            <Textarea id="dataUsed" value={dataUsed} onChange={(e) => setDataUsed(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="riskSelfAssessment">
              Tự đánh giá rủi ro (có chạm dữ liệu khách thật/nội bộ/thương hiệu Mắt Bão không?)
            </Label>
            <Textarea
              id="riskSelfAssessment"
              value={riskSelfAssessment}
              onChange={(e) => setRiskSelfAssessment(e.target.value)}
            />
          </div>

          <div className="mt-2 flex flex-col gap-2 rounded-card border border-stroke bg-surface-2 p-4">
            <label className="flex items-start gap-2 text-caption">
              <input
                type="checkbox"
                checked={confirmFakeData}
                onChange={(e) => setConfirmFakeData(e.target.checked)}
                className="mt-0.5"
              />
              Xác nhận toàn bộ dữ liệu là <b>dữ liệu giả</b> do tôi tự tạo.
            </label>
            <label className="flex items-start gap-2 text-caption">
              <input
                type="checkbox"
                checked={confirmNoMatbaoInfo}
                onChange={(e) => setConfirmNoMatbaoInfo(e.target.checked)}
                className="mt-0.5"
              />
              Cam kết <b>không thể hiện thông tin/thương hiệu Mắt Bão</b> trong sản phẩm & bài đăng.
            </label>
            <label className="flex items-start gap-2 text-caption">
              <input
                type="checkbox"
                checked={confirmTemplateConsent}
                onChange={(e) => setConfirmTemplateConsent(e.target.checked)}
                className="mt-0.5"
              />
              <b>Đồng ý cho Mắt Bão dùng repo của tôi làm Template Vibe Host</b> (có ghi tên tác giả).
            </label>
          </div>

          {error && <p className="text-caption text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Đang gửi..." : "Gửi đăng ký"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
