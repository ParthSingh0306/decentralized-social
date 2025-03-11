"use client";

import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { contract } from "@/app/client";
import { useState, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartIcon, ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";

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

  // Convert BigInt timestamp to number
  const timestamp = Number(post.timestamp) * 1000;

  // Fetch IPFS content if needed
  useEffect(() => {
    const fetchContent = async () => {
      if (post.imageHash) {
        try {
          const response = await fetch(`https://ipfs.io/ipfs/${post.imageHash}`);
          setImageUrl(response.url);
        } catch (error) {
          console.error("Error loading IPFS image:", error);
        }
      }
      if (post.content.startsWith("ipfs://")) {
        try {
          const contentHash = post.content.split("ipfs://")[1];
          const response = await fetch(`https://ipfs.io/ipfs/${contentHash}`);
          setContent(await response.text());
        } catch (error) {
          console.error("Error loading IPFS content:", error);
        }
      }
    };
    
    fetchContent();
  }, [post.imageHash, post.content]);

  const router = useRouter();

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
            {profile?.[2] || post.owner.slice(0, 6)}
          </p>
          <p className="text-sm text-zinc-500">
            {new Date(timestamp).toLocaleDateString()}
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
            post.likesCount > 0 ? 'text-blue-500' : 'text-zinc-500'
          }`}
        >
          <HeartIcon className="h-5 w-5" />
          {isLiking ? 'Liking...' : Number(post.likesCount)}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-blue-500 transition-colors flex items-center gap-1"
        >
          <ChatBubbleOvalLeftIcon className="h-5 w-5" />
          Comment
        </button>
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
              <span className="font-medium text-zinc-300">
                {comment.author?.slice(0, 6)}...{comment.author?.slice(-4)}
              </span>
              <span className="text-zinc-500 text-xs">
                {new Date(Number(comment.timestamp || 0) * 1000).toLocaleDateString()}
              </span>
            </div>
            <p className="text-zinc-100 text-sm mt-1">{comment.content || 'No content'}</p>
          </div>
        ))}
        {loading && comments.length === 0 && (
          <p className="text-zinc-400 text-sm">No comments yet</p>
        )}
      </div>
    </div>
  );
} 