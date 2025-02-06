"use client";

import { ConnectButton } from "thirdweb/react";
import { client, contract } from "./client";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import ProfileForm from "@/components/ProfileForm";
import PostForm from "@/components/PostForm";
import PostItem from "@/components/PostItem";

export default function Home() {
  const account = useActiveAccount();
  
  const { data: profile } = useReadContract({
    contract,
    method: "function profiles(address) view returns (string handle, string name, string bio, string avatar, uint256 followerCount, uint256 followingCount, bool exists)",
    params: [account?.address ?? ""]
  });

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
  const num =1;
  const { data: allPosts, isLoading } = useReadContract({
    contract,
    method: "function posts(uint256) view returns (tuple(address owner, string content, string imageHash, uint256 timestamp, uint256 likesCount, bool exists)[])",
    params: [ num || "" ],
  });

  console.log(allPosts)

  return (
    <div className="space-y-6">
      <PostForm />
      {allPosts
        ?.filter(post => post.exists)
        ?.map((post, index) => (
          <PostItem key={index} post={post} />
        ))}
    </div>
  );
}