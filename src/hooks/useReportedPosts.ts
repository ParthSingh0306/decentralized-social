import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/client";
import { useState, useEffect } from "react";

export function useReportedPosts() {
  const { data: allPosts } = useReadContract({
    contract,
    method: "function getAllPostIds() view returns (uint256[])",
  });

  const [reportedPosts, setReportedPosts] = useState<bigint[]>([]);

  useEffect(() => {
    if (!allPosts) return;

    const checkPosts = async () => {
      const reported: bigint[] = [];
      
      for (const postId of allPosts) {
        const { data: session } = useReadContract({
          contract,
          method: "function getVoteSession(uint256) view returns (uint256 postId, uint256 startTime, uint256 endTime, uint256 yesVotes, uint256 noVotes, bool resolved, bool exists)",
          params: [postId]
        });

        if (session?.[6]) { // exists
          reported.push(postId);
        }
      }

      setReportedPosts(reported);
    };

    checkPosts();
  }, [allPosts]);

  return reportedPosts;
} 