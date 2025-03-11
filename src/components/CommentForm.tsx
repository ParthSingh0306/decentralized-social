"use client";

import { useState } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "@/app/client";

export default function CommentForm({ postId }: { postId: bigint }) {
  const [content, setContent] = useState("");
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !account) return;

    const transaction = prepareContractCall({
      contract,
      method: "function addComment(uint256, string)",
      params: [postId, content]
    });

    await sendTransaction(transaction);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="w-full bg-zinc-800 rounded-lg p-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={2}
        maxLength={280}
      />
      <button
        type="submit"
        disabled={isPending || !content}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
} 