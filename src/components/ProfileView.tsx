"use client";

import { useActiveAccount } from "thirdweb/react";
import { useReadContract } from "thirdweb/react";
import type { Abi } from "viem";
import { useState } from "react";

import { contract } from "@/app/client";
import ProfileForm from "@/components/ProfileForm";

interface Profile {
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
    method: "function profiles(address) view returns (string handle, string name, string bio, string avatar, uint256 followerCount, uint256 followingCount, bool exists)",
    params: [address || account?.address || ""]
  });

  if (!address && !account) return null;
  if (isLoading) return <div>Loading profile...</div>;
  if (!profile?.[6]) return <div>No profile found</div>;

  console.log(profile);
  console.log(profile[4], " ", profile[5]);

  return (
    <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-full overflow-hidden bg-zinc-800">
          {profile[3] && (
            <img
              src={`https://ipfs.io/ipfs/${profile[3]}`}
              alt="Profile avatar"
              className="object-cover size-full"
            />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-zinc-100">{profile[1]}</h2>
          <p className="text-zinc-400">@{profile[0]}</p>
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
          handle: profile[0],
          name: profile[1],
          bio: profile[2],
          avatar: profile[3]
        }} />
      ) : (
        <>
          <p className="text-zinc-300 mb-4">{profile[2]}</p>
          <div className="flex gap-6 text-zinc-400">
            <div>
              <span className="font-medium">{Number(profile[4])}</span> Followers
            </div>
            <div>
              <span className="font-medium">{Number(profile[5])}</span> Following
            </div>
          </div>
        </>
      )}
    </div>
  );
} 