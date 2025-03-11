"use client";

interface Comment {
  author: string;
  content: string;
  timestamp: bigint;
}

export default function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="mt-4 space-y-4">
      {comments.map((comment, index) => (
        <div key={index} className="bg-zinc-800 p-3 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-8 rounded-full bg-zinc-700" />
            <div>
              <p className="text-sm font-medium text-zinc-100">
                {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
              </p>
              <p className="text-xs text-zinc-400">
                {new Date(Number(comment.timestamp) * 1000).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-zinc-300 text-sm">{comment.content}</p>
        </div>
      ))}
    </div>
  );
} 