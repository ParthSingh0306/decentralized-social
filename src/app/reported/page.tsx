"use client";

import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/client";
import PostItem from "@/components/PostItem";
import ReportButton from "@/components/ReportButton";
import ReportedPostCheck from "@/components/ReportedPostCheck";
import { useState, useEffect } from "react";

export default function ReportedPostsPage() {
  const { data: allPosts } = useReadContract({
    contract,
    method: "function getAllPostIds() view returns (uint256[])",
  });

  const [reportedPosts, setReportedPosts] = useState<bigint[]>([]);

  const handleReported = (postId: bigint) => {
    console.log("Adding reported post:", postId);
    setReportedPosts(prev => {
      if (!prev.includes(postId)) {
        return [...prev, postId];
      }
      return prev;
    });
  };

  useEffect(() => {
    console.log("All posts:", allPosts);
    console.log("Reported posts:", reportedPosts);
  }, [allPosts, reportedPosts]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Reported Posts</h1>
      
      {allPosts?.map(postId => (
        <ReportedPostCheck
          key={postId.toString()}
          postId={postId}
          onReported={handleReported}
        />
      ))}

      {reportedPosts.length === 0 ? (
        <p className="text-zinc-400">No reported posts</p>
      ) : (
        <div className="space-y-6">
          {reportedPosts.map((postId) => (
            <div key={postId.toString()} className="space-y-4">
              <PostItem post={{
                id: postId,
                owner: "0x0000000000000000000000000000000000000000",
                content: "",
                imageHash: "",
                timestamp: 0,
                likesCount: 0,
                exists: true
              }} />
              <ReportButton postId={postId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 