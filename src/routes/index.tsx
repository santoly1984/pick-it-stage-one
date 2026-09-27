import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "PICK IT — 음악을 듣고 선택하다" },
    { name: "description", content: "새로운 음악과 무대를 발견하고 마음에 드는 아티스트를 선택하세요." },
    { property: "og:title", content: "PICK IT — 음악을 듣고 선택하다" },
    { property: "og:description", content: "새로운 음악과 무대를 발견하고 마음에 드는 아티스트를 선택하세요." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  beforeLoad: () => {
    throw redirect({ to: "/welcome" });
  },
  component: () => null,
});
