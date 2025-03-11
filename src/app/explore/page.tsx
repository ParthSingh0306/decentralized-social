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
  const { data: profiles, isLoading } = useReadContract({
    contract,
    method: "function showAllProfiles() view returns ((address userAddress, string handle, string name, string bio, string avatar, uint256 followerCount, uint256 followingCount, bool exists)[])",
    params: [],
  });

  const account = useActiveAccount();
  const router = useRouter();

  if (!account) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Explore Profiles</h1>
        <p className="text-zinc-400 mb-4">
          Connect your wallet to view and follow profiles
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  console.log(profiles)

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Explore Profiles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(profiles as any[])
          ?.filter(p => p.exists && p.owner !== account?.address)
          ?.map((profile, index) => {
            // Add null checks and safe conversions
            const ownerAddress = profile.owner?.toString() || '';
            const userAddress = profile.userAddress;
            const followerCount = Number(profile.followerCount) || 0;
            
            return (
              <ProfileCard 
                key={index}
                profile={{
                    userAddress,
                  owner: ownerAddress,
                  handle: profile.handle || '',
                  name: profile.name || 'Unnamed Profile',
                  avatar: profile.avatar || '',
                  followerCount: followerCount,
                  exists: profile.exists
                }}
              />
            );
          })}
      </div>
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  const { mutateAsync: sendTransaction, isPending, isSuccess } = useSendTransaction();
  const account = useActiveAccount();

  const handleFollow = async () => {
    console.log("Follow button clicked");
    if (!account) {
      console.log("No account connected");
      return;
    }

    console.log("profile owner: ", profile?.userAddress)

    if (!profile.userAddress || typeof profile.userAddress !== "string") {
      console.error("Invalid profile owner address:", profile.userAddress);
      return;
    }

    console.log("Attempting to follow:", profile.userAddress);
    
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function follow(address _toFollow)",
        params: [profile.userAddress.toLowerCase()]
      });
      
      const result = await sendTransaction(transaction);
      console.log("Transaction successful:", result.transactionHash);
    } catch (error) {
      console.error("Follow transaction failed:", error);
      alert(`Follow failed: ${(error as Error).message}`);
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
          disabled={isPending || isSuccess}
          className={`${
            isSuccess ? "bg-green-600 hover:bg-green-700" : 
            "bg-blue-600 hover:bg-blue-700"
          } text-white px-3 py-1 rounded-md text-sm transition-colors disabled:opacity-50`}
        >
          {isPending ? "Following..." : 
           isSuccess ? "Following ✓" : 
           "Follow"}
        </button>
      </div>
    </div>
  );
}