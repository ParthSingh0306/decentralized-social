"use client";

import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { HomeIcon, UserIcon } from "@heroicons/react/24/outline";

export default function BottomNav() {
  const account = useActiveAccount();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-2xl mx-auto flex justify-around p-4">
        <button
          onClick={() => router.push("/")}
          className="text-zinc-300 hover:text-white transition-colors"
        >
          <HomeIcon className="h-6 w-6 mx-auto" />
        </button>
        
        <button
          onClick={() => router.push("/explore")}
          className="text-zinc-300 hover:text-white transition-colors"
        >
          {/* <GlobeIcon className="h-6 w-6 mx-auto" /> */}
          <div>Explore</div>
        </button>

        <button
          onClick={() => {
            if (account?.address) {
              router.push(`/profile/${account.address}`);
            }
          }}
          className="text-zinc-300 hover:text-white transition-colors"
          disabled={!account?.address}
        >
          <UserIcon className="h-6 w-6 mx-auto" />
        </button>
      </div>
    </div>
  );
}
