import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { auditionService } from "@/services";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "오디션 지원 — PICK IT" },
      { name: "description", content: "진행 중인 PICK IT 오디션에 내 무대를 지원하세요. 현재 시즌 1 군 장병 음악 오디션 접수 중." },
      { property: "og:title", content: "오디션 지원 — PICK IT" },
      { property: "og:description", content: "진행 중인 PICK IT 오디션에 내 무대를 지원하세요. 현재 시즌 1 군 장병 음악 오디션 접수 중." },
    ],
  }),
  component: Apply,
});

function Apply() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    artistName: "",
    unit: "",
    contact: "",
    songTitle: "",
    story: "",
    intro: "",
    motivation: "",
    songReason: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await auditionService.submitApplication({ ...form, story: [form.intro, form.motivation, form.songReason].filter(Boolean).join("\n\n") });
    setSubmitting(false);
    toast.success("지원서가 접수됐습니다", { description: `접수번호 ${res.applicationId}` });
  };

  return (
    <div className="min-h-screen">
      <PageHeader title="오디션 지원" subtitle="시즌 1 · 군 장병 음악 오디션 · 지원서 예시(mock)" backTo="/home" />
      <form onSubmit={submit} className="space-y-5 px-5 py-6">
        <div className="panel p-4 text-xs leading-relaxed text-muted-foreground">
          지원 후 부대 지휘관 확인 절차가 진행됩니다. 이번 단계에서는 파일 업로드와 심사 연동이 mock으로 동작합니다.
        </div>

        <Field label="활동명">
          <Input value={form.artistName} onChange={set("artistName")} placeholder="무대에서 쓸 이름" required />
        </Field>
        <Field label="소속 부대">
          <Input value={form.unit} onChange={set("unit")} placeholder="예: 육군 제3보병사단" required />
        </Field>
        <Field label="연락처">
          <Input value={form.contact} onChange={set("contact")} placeholder="이메일 또는 휴대전화" required />
        </Field>
        <Field label="곡 제목">
          <Input value={form.songTitle} onChange={set("songTitle")} placeholder="출품할 곡 제목" required />
        </Field>
        <Field label="소개">
          <Textarea value={form.intro} onChange={set("intro")} rows={3} placeholder="나는 어떤 음악을 하는 사람인가요?" />
        </Field>
        <Field label="참가 계기">
          <Textarea value={form.motivation} onChange={set("motivation")} rows={3} placeholder="이 오디션에 지원한 이유를 들려주세요." />
        </Field>
        <Field label="선곡 이유">
          <Textarea value={form.songReason} onChange={set("songReason")} rows={3} placeholder="왜 이 곡으로 무대에 서나요?" />
        </Field>

        <div className="panel flex items-center justify-between p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">음원 파일</p>
            <p className="text-xs text-muted-foreground">mp3 / wav · 최대 20MB (mock)</p>
          </div>
          <Button type="button" variant="secondary" size="sm">
            파일 선택
          </Button>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "접수 중..." : "지원서 제출"}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
