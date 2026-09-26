import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { FullPlayer } from "@/features/player/FullPlayer";

export const Route = createFileRoute("/player")({
  head: () => ({
    meta: [
      { title: "플레이어 — PICK IT" },
      { name: "description", content: "가사와 함께 무대를 감상하세요." },
      { property: "og:title", content: "플레이어 — PICK IT" },
      { property: "og:description", content: "가사와 함께 무대를 감상하세요." },
    ],
  }),
  component: PlayerPage,
});

function PlayerPage() {
  return (
    <div className="min-h-screen">
      <PageHeader title="지금 재생 중" backTo="/home" />
      <FullPlayer />
    </div>
  );
}
