"use client";

import { useActiveAccount } from "thirdweb/react";
import { useReadContract } from "thirdweb/react";
import type { Abi } from "viem";
import { useState } from "react";

import { contract } from "@/app/client";
import ProfileForm from "@/components/ProfileForm";
import PostFetcher from "@/components/PostFetcher";

interface Profile {
  userAddress: string;
  exists: boolean;
  name: string;
  handle: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  avatar?: string;
}

interface ProfileViewProps {
  address?: string;
}

export default function ProfileView({ address }: ProfileViewProps) {
  const account = useActiveAccount();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useReadContract({
    contract,
    method: "function profiles(address) view returns (address userAddress, string handle, string name, string bio, string avatar, uint256 followerCount, uint256 followingCount, bool exists)",
    params: [address || account?.address || ""]
  });

  const { data: postIds } = useReadContract({
    contract,
    method: "function getPostsByUser(address) view returns (uint256[])",
    params: [address || account?.address || ""]
  });

  if (!address && !account) return null;
  if (isLoading) return <div>Loading profile...</div>;
  if (!profile?.[7]) return <div>No profile found</div>;

  console.log(profile);
  console.log(profile[5], " ", profile[6]);

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-full overflow-hidden bg-zinc-800">
          {profile[4] && (
            <img
              src={`https://ipfs.io/ipfs/${profile[4]}`}
              alt="Profile avatar"
              className="object-cover size-full"
            />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-zinc-100">{profile[2]}</h2>
          <p className="text-zinc-400">@{profile[1]}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="ml-auto bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {isEditing ? (
        <ProfileForm existingProfile={{
          handle: profile[1],
          name: profile[2],
          bio: profile[3],
          avatar: profile[4]
        }} />
      ) : (
        <>
          <p className="text-zinc-300 mb-4">{profile[3]}</p>
          <div className="flex gap-6 text-zinc-400">
            <div>
              <span className="font-medium">{Number(profile[5])}</span> Followers
            </div>
            <div>
              <span className="font-medium">{Number(profile[6])}</span> Following
            </div>
          </div>
        </>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-100">Posts</h3>
        {postIds?.map(postId => (
          <PostFetcher key={Number(postId)} postId={postId} />
        ))}
      </div>
    </div>
  );
} 