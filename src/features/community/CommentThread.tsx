import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Flag, Send } from "lucide-react";
import { toast } from "sonner";
import { communityService } from "@/services";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Comment } from "@/types";

export function CommentThread({ entryId }: { entryId?: string }) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", entryId ?? "all"],
    queryFn: () => communityService.listComments(entryId),
  });

  const add = useMutation({
    mutationFn: () =>
      communityService.addComment({
        entryId: entryId ?? replyTo?.entryId ?? "e_1",
        body,
        ...(replyTo ? { parentId: replyTo.id } : {}),
      }),
    onSuccess: () => {
      setBody("");
      setReplyTo(null);
      void qc.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const report = useMutation({
    mutationFn: (id: string) => communityService.report(id, "user_report"),
    onSuccess: () => toast.success("신고가 접수됐습니다"),
  });

  const roots = comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentId === id);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {roots.map((c) => (
          <div key={c.id} className="space-y-2">
            <CommentRow comment={c} onReply={() => setReplyTo(c)} onReport={() => report.mutate(c.id)} />
            {repliesOf(c.id).map((r) => (
              <div key={r.id} className="pl-6">
                <CommentRow comment={r} onReport={() => report.mutate(r.id)} />
              </div>
            ))}
          </div>
        ))}
        {!roots.length && <p className="text-sm text-muted-foreground">첫 응원 댓글을 남겨보세요.</p>}
      </div>

      <div className="panel space-y-2 p-3">
        {replyTo && (
          <p className="text-xs text-muted-foreground">
            {replyTo.authorName} 님에게 답글 ·{" "}
            <button type="button" className="underline" onClick={() => setReplyTo(null)}>
              취소
            </button>
          </p>
        )}
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="응원 메시지를 남겨주세요"
          className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
        />
        <div className="flex justify-end">
          <Button size="sm" disabled={!body.trim() || add.isPending} onClick={() => add.mutate()}>
            <Send className="size-3.5" /> 등록
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  onReply,
  onReport,
}: {
  comment: Comment;
  onReply?: () => void;
  onReport?: () => void;
}) {
  return (
    <div className="panel p-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-xs">
          <span className="truncate font-semibold">{comment.authorName}</span>
          {comment.isVerifiedChallenger && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/25 px-2 py-0.5 text-[10px] text-accent">
              <BadgeCheck className="size-3" /> 참가자 인증
            </span>
          )}
        </p>
        <button type="button" aria-label="신고" onClick={onReport} className="shrink-0 text-muted-foreground">
          <Flag className="size-3.5" />
        </button>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{comment.body}</p>
      {onReply && (
        <button type="button" onClick={onReply} className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:underline">
          답글
        </button>
      )}
      {comment.reported && <p className="mt-2 text-[11px] text-destructive">신고 접수됨 · 검토 대기</p>}
    </div>
  );
}
