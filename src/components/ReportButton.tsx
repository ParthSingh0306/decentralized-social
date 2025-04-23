"use client";

import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { contract } from "@/app/client";
import { useState, useEffect } from "react";
import { prepareContractCall } from "thirdweb";
import { FlagIcon } from "@heroicons/react/24/outline";

interface ReportButtonProps {
  postId: bigint;
}

interface VoteSession {
  postId: bigint;
  startTime: bigint;
  endTime: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  resolved: boolean;
  exists: boolean;
}

export default function ReportButton({ postId }: ReportButtonProps) {
  const account = useActiveAccount();
  const { mutate: sendReport, isPending: isReporting } = useSendTransaction();
  const { mutate: sendVote, isPending: isVoting } = useSendTransaction();
  const { mutate: sendResolve, isPending: isResolving } = useSendTransaction();
  const [error, setError] = useState<string | null>(null);

  const { data: voteSession } = useReadContract({
    contract,
    method: "function getVoteSession(uint256 _postId) view returns ((uint256 postId, uint256 startTime, uint256 endTime, uint256 yesVotes, uint256 noVotes, bool resolved, bool exists))",
    params: [BigInt(postId)]
  });

  const { data: hasReported } = useReadContract({
    contract,
    method: "function hasReported(uint256, address) view returns (bool)",
    params: [BigInt(postId), account?.address || "0x0000000000000000000000000000000000000000"]
  });

  const { data: hasVoted } = useReadContract({
    contract,
    method: "function hasVoted(uint256, address) view returns (bool)",
    params: [BigInt(postId), account?.address || "0x0000000000000000000000000000000000000000"]
  });

  const handleReport = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      console.log("Preparing report transaction for post:", postId.toString());
      const transaction = prepareContractCall({
        contract,
        method: "function reportPost(uint256 _postId)",
        params: [BigInt(postId)]
      });
      
      console.log("Sending report transaction...");
      await sendReport(transaction, {
        onSuccess: () => {
          console.log("Report successful");
          setError(null);
        },
        onError: (error) => {
          console.error("Report failed:", error);
          setError("Failed to report post. Please try again.");
        }
      });
    } catch (error) {
      console.error("Error in handleReport:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const handleVote = async (isInFavor: boolean) => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function castVote(uint256 _postId, bool _isInFavor)",
        params: [BigInt(postId), isInFavor]
      });
      
      await sendVote(transaction, {
        onSuccess: () => {
          console.log("Vote successful");
          setError(null);
        },
        onError: (error) => {
          console.error("Vote failed:", error);
          setError("Already voted");
        }
      });
    } catch (error) {
      console.error("Error in handleVote:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const handleResolve = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      const transaction = prepareContractCall({
        contract,
        method: "function resolveVote(uint256 _postId)",
        params: [BigInt(postId)]
      });
      
      await sendResolve(transaction, {
        onSuccess: () => {
          console.log("Vote resolved successfully");
          setError(null);
        },
        onError: (error) => {
          console.error("Resolve failed:", error);
          setError("Failed to resolve vote. Please try again.");
        }
      });
    } catch (error) {
      console.error("Error in handleResolve:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const isVotingActive = voteSession?.exists && !voteSession?.resolved && 
    Number(voteSession?.startTime) * 1000 + 24 * 60 * 60 * 1000 > Date.now();

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {!voteSession?.exists && !hasReported && (
        <button
          onClick={handleReport}
          disabled={isReporting}
          className="flex items-center gap-1 text-zinc-500 hover:text-red-500 transition-colors"
        >
          <FlagIcon className="h-5 w-5" />
          {isReporting ? 'Reporting...' : 'Report'}
        </button>
      )}

      {isVotingActive && (
        <div className="flex gap-2">
          {hasVoted ? (
            <span className="text-sm text-gray-500">
              You have voted on this post
            </span>
          ) : (
            <>
              <button
                onClick={() => handleVote(true)}
                disabled={isVoting}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {isVoting ? 'Voting...' : 'Keep Post'}
              </button>
              <button
                onClick={() => handleVote(false)}
                disabled={isVoting}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {isVoting ? 'Voting...' : 'Remove Post'}
              </button>
            </>
          )}
        </div>
      )}

      {voteSession?.exists && !voteSession?.resolved && !isVotingActive && (
        <button
          onClick={handleResolve}
          disabled={isResolving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {isResolving ? 'Resolving...' : 'Resolve Vote'}
        </button>
      )}

      {voteSession?.exists && (
        <div className="text-sm text-zinc-500">
          <p>Votes: {Number(voteSession?.yesVotes)} Keep / {Number(voteSession?.noVotes)} Remove</p>
          <p>Ends: {new Date(Number(voteSession?.startTime) * 1000 + 24 * 60 * 60 * 1000).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
} 