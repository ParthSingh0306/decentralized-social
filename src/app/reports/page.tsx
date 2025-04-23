"use client";

import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/client";
import { useState, useEffect } from "react";
import { Post } from "@/types/post";

interface VoteSession {
  postId: bigint;
  startTime: bigint;
  endTime: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  resolved: boolean;
  exists: boolean;
}

export default function ReportsPage() {
  const [reportedPosts, setReportedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<bigint>(BigInt(0));

  const { data: currentPost } = useReadContract({
    contract,
    method: "function getPost(uint256 _postId) view returns ((uint256 id, address author, string content, uint256 timestamp))",
    params: [currentPostId]
  });

  const { data: currentVoteSession } = useReadContract({
    contract,
    method: "function getVoteSession(uint256 _postId) view returns ((uint256 postId, uint256 startTime, uint256 endTime, uint256 yesVotes, uint256 noVotes, bool resolved, bool exists))",
    params: [currentPostId]
  });

  useEffect(() => {
    const findReportedPosts = async () => {
      setLoading(true);
      const reported = [];
      
      // Loop through post IDs from 0 to 10
      for (let i = 0; i <= 10; i++) {
        setCurrentPostId(BigInt(i));
        // Wait a bit to let the hooks update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (currentVoteSession?.exists) {
          if (currentPost) {
            reported.push(currentPost);
            console.log("Found reported post:", currentPost);
          }
        }
      }
      
      setReportedPosts(reported);
      setLoading(false);
    };

    findReportedPosts();
  }, [currentPost, currentVoteSession]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reported Posts</h1>
      
      {reportedPosts.length === 0 ? (
        <p className="text-gray-500">No reported posts found.</p>
      ) : (
        <div className="space-y-6">
          {reportedPosts.map((post) => (
            <ReportedPostCard key={post.id.toString()} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportedPostCard({ post }: { post: Post }) {
  const { data: voteSession } = useReadContract({
    contract,
    method: "function getVoteSession(uint256 _postId) view returns ((uint256 postId, uint256 startTime, uint256 endTime, uint256 yesVotes, uint256 noVotes, bool resolved, bool exists))",
    params: [post.id]
  });

  const timeLeft = voteSession ? Number(voteSession.endTime) * 1000 - Date.now() : 0;
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">{post.content}</h2>
          <p className="text-gray-500 text-sm">
            Posted by: {post.author.slice(0, 6)}...{post.author.slice(-4)}
          </p>
        </div>
      </div>

      {voteSession && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Keep Votes: {voteSession.yesVotes.toString()}</span>
            <span>Remove Votes: {voteSession.noVotes.toString()}</span>
          </div>
          
          <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full"
              style={{ 
                width: `${Number(voteSession.yesVotes) / (Number(voteSession.yesVotes) + Number(voteSession.noVotes)) * 100 || 0}%` 
              }}
            />
          </div>

          <p className="text-sm text-gray-600">
            {voteSession.resolved ? (
              "Vote Resolved"
            ) : (
              `${hoursLeft} hours remaining`
            )}
          </p>
        </div>
      )}
    </div>
  );
} 