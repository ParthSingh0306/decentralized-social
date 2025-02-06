"use client";

import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/client";
import PostItem from "@/components/PostItem";

export default function PostFetcher({ postId }: { postId: bigint }) {
  const { data: post } = useReadContract({
    contract,
    method: "function getPostDetails(uint256) view returns (address, string, string, uint256, uint256, bool)",
    params: [postId]
  });

  if (!post?.[5]) return null;

  return (
    <PostItem
      post={{
        owner: post[0],
        content: post[1],
        imageHash: post[2],
        timestamp: Number(post[3]),
        likesCount: Number(post[4]),
        exists: post[5]
      }}
    />
  );
} 