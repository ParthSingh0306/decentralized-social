"use client";

import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HomeIcon, UserIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
  const router = useRouter();
  const account = useActiveAccount();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`fixed top-0 left-0 h-screen bg-zinc-900 border-r border-zinc-800 transition-all duration-300 ${
      isCollapsed ? "w-20" : "w-64"
    }`}>
      <div className="flex flex-col h-full p-4">
        <div className="flex-1 space-y-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center w-full p-3 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors group"
          >
            <HomeIcon className="h-6 w-6 mr-3" />
            {!isCollapsed && <span>Home</span>}
          </button>

          <button
            onClick={() => account?.address && router.push(`/profile/${account.address}`)}
            className="flex items-center w-full p-3 text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors group"
            disabled={!account?.address}
          >
            <UserIcon className="h-6 w-6 mr-3" />
            {!isCollapsed && <span>Profile</span>}
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-4 p-3 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowsPointingOutIcon className={`h-6 w-6 text-zinc-400 transition-transform ${
            isCollapsed ? "rotate-180" : ""
          }`} />
        </button>
      </div>
    </div>
  );
} 