import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { auditionService } from "@/services";
import { StoryFlow } from "@/features/artist/StoryFlow";

export const Route = createFileRoute("/artist/$id/story")({
  head: () => ({
    meta: [
      { title: "참가자 스토리 — PICK IT" },
      { name: "description", content: "이 무대가 만들어지기까지의 이야기를 읽어보세요." },
      { property: "og:title", content: "참가자 스토리 — PICK IT" },
      { property: "og:description", content: "이 무대가 만들어지기까지의 이야기를 읽어보세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ArtistStory,
});

function ArtistStory() {
  const { id } = Route.useParams();
  const { data: entry } = useQuery({ queryKey: ["entry", id], queryFn: () => auditionService.getEntry(id) });

  return (
    <div className="min-h-screen">
      <PageHeader title="스토리" {...(entry ? { subtitle: entry.artistName } : {})} backTo="/ranking" />
      <article className="px-5 py-6">
        {entry ? (
          <>
            <h2 className="text-2xl font-bold leading-snug tracking-tight">{entry.tagline}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{entry.branch}</p>
            <div className="mt-8">
              <StoryFlow entry={entry} />
            </div>
            <h3 className="mt-10 text-sm font-semibold text-muted-foreground">전체 이야기</h3>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-8">{entry.story}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        )}
      </article>
    </div>
  );
}
