"use client";

import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "@/app/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Profile {
  userAddress: string;
  owner: string;
  handle: string;
  name: string;
  avatar: string;
  followerCount: number;
  exists: boolean;
}

export default function ExplorePage() {
  const account = useActiveAccount();
  const { data: profiles } = useReadContract({
    contract,
    method: "function showAllProfiles() view returns ((address userAddress, string handle, string name, string bio, string avatar, uint256 followerCount, uint256 followingCount, bool exists)[])",
    params: [],
  });

  console.log(profiles)

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Explore Profiles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(profiles as any[])
          ?.filter(p => p.exists && p.userAddress !== account?.address)
          ?.map((profile, index) => (
            <ProfileCard
              key={index}
              profile={{
                userAddress: profile.userAddress,
                owner: profile.owner,
                handle: profile.handle,
                name: profile.name,
                avatar: profile.avatar,
                followerCount: Number(profile.followerCount),
                exists: profile.exists
              }}
            />
          ))}
      </div>
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  const account = useActiveAccount();
  const { data: isFollowing, refetch } = useReadContract({
    contract,
    method: "function isFollowing(address _user, address _toCheck) view returns (bool)",
    params: [account?.address ?? "", profile?.userAddress]
  });

  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

  const handleFollow = async () => {
    try {
      const transaction = prepareContractCall({
        contract,
        method: `function ${isFollowing ? "unfollow" : "follow"}(address _toFollow)`,
        params: [profile.userAddress]
      });
      
      await sendTransaction(transaction);
      refetch(); // Refresh the following status
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-zinc-700 transition-colors">
      <Link href={`/profile/${profile.owner}`} className="block space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-zinc-800 overflow-hidden">
            {profile.avatar && (
              <img
                src={`https://ipfs.io/ipfs/${profile.avatar}`}
                className="object-cover size-full"
                alt="Profile avatar"
              />
            )}
          </div>
          <div>
            <h3 className="font-medium text-zinc-100">{profile.name}</h3>
            <p className="text-sm text-zinc-400">@{profile.handle}</p>
          </div>
        </div>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-zinc-400">
          {profile.followerCount} followers
        </span>
        <button
          onClick={handleFollow}
          disabled={isPending}
          className={`${
            isFollowing ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-3 py-1 rounded-md text-sm transition-colors disabled:opacity-50`}
        >
          {isPending ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
    </div>
  );
}