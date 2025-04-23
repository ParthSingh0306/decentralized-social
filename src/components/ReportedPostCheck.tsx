"use client";

import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/client";
import { useState, useEffect } from "react";

interface ReportedPostCheckProps {
  postId: bigint;
  onReported: (postId: bigint) => void;
}

interface VoteSession {
  postId: bigint;
  startTime: bigint;
  endTime: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  resolved: boolean;
  exists: boolean;
}

export default function ReportedPostCheck({ postId, onReported }: ReportedPostCheckProps) {
  const { data: session, isPending } = useReadContract({
    contract,
    method: "function getVoteSession(uint256 _postId) view returns ((uint256 postId, uint256 startTime, uint256 endTime, uint256 yesVotes, uint256 noVotes, bool resolved, bool exists))",
    params: [BigInt(postId)]
  });

  useEffect(() => {
    console.log("Checking post:", postId.toString(), "Session:", session);
    if (session?.exists) {
      console.log("Found reported post:", postId.toString());
      onReported(postId);
    }
  }, [session, postId, onReported]);

  return null;
} 