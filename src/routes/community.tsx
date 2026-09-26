import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommentThread } from "@/features/community/CommentThread";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "커뮤니티 — PICK IT" },
      { name: "description", content: "장병들의 무대에 응원을 남기고 참가자의 답글을 확인하세요." },
      { property: "og:title", content: "커뮤니티 — PICK IT" },
      { property: "og:description", content: "장병들의 무대에 응원을 남기고 참가자의 답글을 확인하세요." },
    ],
  }),
  component: Community,
});

function Community() {
  return (
    <div className="min-h-screen">
      <PageHeader title="커뮤니티" subtitle="응원과 참가자 답글" />
      <div className="px-5 py-4">
        <p className="panel mb-4 p-3 text-xs leading-relaxed text-muted-foreground">
          비방·개인정보·부대 보안에 관련된 내용은 신고해주세요. 참가자 본인이 남긴 답글에는 인증 배지가 표시됩니다.
        </p>
        <CommentThread />
      </div>
    </div>
  );
}
