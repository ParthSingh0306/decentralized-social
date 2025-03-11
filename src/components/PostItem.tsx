"use client";

import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { contract } from "@/app/client";
import { useState, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  const { mutate: sendTransaction } = useSendTransaction();
  const account = useActiveAccount();
  const router = useRouter();

  const handleLike = async () => {
    if (!account) return;
    
    const transaction = prepareContractCall({
      contract,
      method: "function likePost(uint256)",
      params: [post.id]
    });

    await sendTransaction(transaction);
  };

  return (
    <div 
      className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors"
      onClick={() => router.push(`/post/${post.id}`)}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-full bg-zinc-800">
          {profile?.[4] && (
            <img 
              src={`https://ipfs.io/ipfs/${profile[3]}`} 
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
      
      <div className="flex gap-6 text-zinc-500" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={handleLike}
          className={`hover:text-blue-500 transition-colors ${post.likesCount > 0 ? 'text-blue-500' : 'text-zinc-500'}`}
        >
          {post.likesCount > 0 ? 'Liked' : 'Like'} ({Number(post.likesCount)})
        </button>
        <button
          onClick={() => router.push(`/post/${post.id}`)}
          className="hover:text-blue-500 transition-colors"
        >
          Comment
        </button>
      </div>
    </div>
  );
} 