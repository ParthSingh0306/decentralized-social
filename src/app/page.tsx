"use client";

import { ConnectButton } from "thirdweb/react";
import { client, contract } from "./client";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import ProfileForm from "@/components/ProfileForm";
import ProfileView from "@/components/ProfileView";
import { redirect } from "next/navigation";

export default function Home() {
  const account = useActiveAccount();
  
  const { data: profile } = useReadContract({
    contract,
    method: "function profiles(address) view returns (string handle, string name, string bio, string avatar, uint256 followerCount, uint256 followingCount, bool exists)",
    params: [account?.address ?? ""]
  });

  console.log(profile);

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto p-4">
        <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-bold text-zinc-100">Decentralized Social</h1>
          <ConnectButton
            client={client}
            appMetadata={{
              name: "Decentralized Social",
              url: typeof window !== "undefined" ? window.location.origin : "",
            }}
          />
        </header>

        {account ? (
          profile?.[6] ? (
            <Feed />
          ) : (
            <ProfileForm />
          )
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-400 mb-4">Connect your wallet to view the decentralized social feed</p>
          </div>
        )}
      </div>
    </main>
  );
}

function Feed() {
  const posts = [
    {
      id: 1,
      content: "Just posted my first decentralized social media update! 🚀",
      author: "0x123...abc",
      likes: 42,
      timestamp: "2h ago"
    },
    {
      id: 2,
      content: "Decentralized social media is the future! 💡",
      author: "0x456...def",
      likes: 28,
      timestamp: "4h ago"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Create Post Input */}
      <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
        <textarea
          placeholder="What's on your mind?"
          className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none"
          rows={3}
        />
        <div className="flex justify-end mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Post
          </button>
        </div>
      </div>

      {/* Posts List */}
      {posts.map(post => (
        <div key={post.id} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-full bg-zinc-800" />
            <div>
              <p className="font-medium text-zinc-100">{post.author}</p>
              <p className="text-sm text-zinc-500">{post.timestamp}</p>
            </div>
          </div>
          <p className="text-zinc-100 mb-4">{post.content}</p>
          <div className="flex gap-6 text-zinc-500">
            <button className="hover:text-blue-500 transition-colors">Like ({post.likes})</button>
            <button className="hover:text-green-500 transition-colors">Comment</button>
            <button className="hover:text-red-500 transition-colors">Share</button>
          </div>
        </div>
      ))}
    </div>
  );
}
