"use client";

import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/client";
import { useState, useEffect } from "react";

export default function PostItem({ post }: any) {
  const { data: profile } = useReadContract({
    contract,
    method: "function profiles(address) view returns (string handle, string name, string bio, string avatar, uint256 followerCount, uint256 followingCount, bool exists)",
    params: [post.author]
  });

  console.log(profile)

  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState("");

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

  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-full bg-zinc-800">
          {profile?.[2] && (
            <img 
              src={`https://ipfs.io/ipfs/${profile[2]}`} 
              className="rounded-full"
            />
          )}
        </div>
        <div>
          <p className="font-medium text-zinc-100">
            {profile?.[1] || post.author}
          </p>
          <p className="text-sm text-zinc-500">
            {new Date(post.timestamp * 1000).toLocaleDateString()}
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
      
      <div className="flex gap-6 text-zinc-500">
        <button className="hover:text-blue-500 transition-colors">
          Like ({post.likes})
        </button>
      </div>
    </div>
  );
} 