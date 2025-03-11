import PostFetcher from "@/components/PostFetcher";
import CommentForm from "@/components/CommentForm";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/client";
import CommentList from "@/components/CommentList";

// Add Comment type definition at the top
interface Comment {
  author: string;
  content: string;
  timestamp: bigint;
}

export default function PostPage({ 
  params 
}: { 
  params: { postId: string } 
}) {
  // Add validation for postId parameter
  console.log(params.postId)
  if (!params?.postId) {
    return <div className="text-red-500 p-4">Invalid post ID</div>;
  }

    const postId = BigInt(params.postId);
  
    // Temporary empty comments array
    const commentsData: Comment[] = [];

    return (
      <div className="space-y-6">
        <PostFetcher postId={postId} />
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Comments</h3>
          <CommentForm postId={postId} />
          {commentsData.length > 0 ? (
            <CommentList comments={commentsData} />
          ) : (
            <p className="text-zinc-400 text-sm mt-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    );
} 