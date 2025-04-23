"use client";

import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { contract } from "@/app/client";
import { useState, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import ReportButton from "@/components/ReportButton";

interface PostType {
  id: bigint;
  owner: string;
  content: string;
  imageHash: string;
  timestamp: number;
  likesCount: number;
  exists: boolean;
}

interface PostItemProps {
  post: PostType;
}

interface Comment {
  author: string;
  content: string;
  timestamp: bigint;
}

function CommentAuthor({ address }: { address: string }) {
  const { data: profile } = useReadContract({
    contract,
    method: "function profiles(address) view returns (address userAddress, string handle, string name, string bio, string avatar, uint256 followerCount, uint256 followingCount, bool exists)",
    params: [address]
  });

  return (
    <span className="font-medium text-zinc-300">
      {profile?.[2] || `${address.slice(0, 6)}...${address.slice(-4)}`}
    </span>
  );
}

export default function PostItem({ post }: PostItemProps) {
  const { data: profile } = useReadContract({
    contract,
    method: "function profiles(address) view returns (address userAddress, string handle, string name, string bio, string avatar, uint256 followerCount, uint256 followingCount, bool exists)",
    params: [post.owner]
  });

  console.log(profile)
  console.log(post)

  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState("");
  const account = useActiveAccount();
  const { mutate: sendLike, isPending: isLiking } = useSendTransaction();
  const { mutate: sendComment, isPending: isCommenting } = useSendTransaction();
  const [commentContent, setCommentContent] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const { data: postDetails } = useReadContract({
    contract,
    method: "function getPostDetails(uint256) view returns (address owner, string content, string imageHash, uint256 timestamp, uint256 likesCount, bool exists)",
    params: [post.id]
  });

  // Update the post data when details are fetched
  useEffect(() => {
    if (postDetails) {
      setContent(postDetails[1] || "");
      setImageUrl(postDetails[2] ? `https://ipfs.io/ipfs/${postDetails[2]}` : "");
    }
  }, [postDetails]);

  const handleLike = () => {
    if (!account) return;
    
    const transaction = prepareContractCall({
      contract,
      method: "function likePost(uint256 _postId)",
      params: [post.id]
    });
    
    sendLike(transaction);
  };

  const handleComment = () => {
    if (!account || !commentContent.trim()) return;
    
    const transaction = prepareContractCall({
      contract,
      method: "function addComment(uint256 _postId, string _content)",
      params: [post.id, commentContent.trim()]
    });
    
    sendComment(transaction);
    setCommentContent("");
  };

  const { data: commentData } = useReadContract({
    contract,
    method: "function postComments(uint256, uint256) view returns (address author, string content, uint256 timestamp)",
    params: [post.id, BigInt(comments.length)] // Get next comment
  });

  useEffect(() => {
    if (commentData) {
      setComments(prev => [...prev, {
        author: commentData[0] || '0x0000000000000000000000000000000000000000', // Fallback address
        content: commentData[1] || '', // Fallback content
        timestamp: commentData[2] || BigInt(0) // Fallback timestamp
      }]);
      setLoading(false);
    }
  }, [commentData]);

  return (
    <div 
      className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors"
      onClick={() => router.push(`/post/${post.id}`)}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-full bg-zinc-800">
          {profile?.[4] && (
            <img 
              src={`https://ipfs.io/ipfs/${profile[4]}`} 
              className="rounded-full"
            />
          )}
        </div>
        <div>
          <p className="font-medium text-zinc-100">
            {profile?.[2] || postDetails?.[0]?.slice(0, 6) || "Unknown"}
          </p>
          <p className="text-sm text-zinc-500">
            {postDetails?.[3] ? new Date(Number(postDetails[3]) * 1000).toLocaleDateString() : "Unknown date"}
          </p>
        </div>
      </div>
      
      {content && <p className="text-zinc-100 mb-4">{content}</p>}
      {imageUrl && (
        <img 
          src={imageUrl} 
          className="mb-4 rounded-lg max-h-96 object-cover w-full"
        />
      )}
      
      <div className="flex gap-6 items-center text-zinc-500" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1 hover:text-blue-500 transition-colors ${
            (postDetails?.[4] || 0) > 0 ? 'text-blue-500' : 'text-zinc-500'
          }`}
        >
          <HeartIcon className="h-5 w-5" />
          {isLiking ? 'Liking...' : Number(postDetails?.[4] || 0)}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-blue-500 transition-colors flex items-center gap-1"
        >
          <ChatBubbleOvalLeftIcon className="h-5 w-5" />
          Comment
        </button>

        <ReportButton postId={post.id} />
      </div>

      {showComments && (
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="bg-zinc-800 text-zinc-100 px-3 py-2 rounded-lg flex-1 text-sm"
            />
            <button
              onClick={handleComment}
              disabled={isCommenting || !commentContent.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {isCommenting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-2 space-y-2">
        {comments.map((comment, index) => (
          <div key={index} className="bg-zinc-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CommentAuthor address={comment.author} />
              <span className="text-zinc-500 text-xs">
                {new Date(Number(comment.timestamp) * 1000).toLocaleDateString()}
              </span>
            </div>
            <p className="text-zinc-100 text-sm mt-1">{comment.content}</p>
          </div>
        ))}
        {loading && comments.length === 0 && (
          <p className="text-zinc-400 text-sm">No comments yet</p>
        )}
      </div>
    </div>
  );
} 