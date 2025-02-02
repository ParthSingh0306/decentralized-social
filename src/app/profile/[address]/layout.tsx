"use client";

import { useRouter } from "next/navigation";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <button
          onClick={() => router.back()}
          className="mb-6 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors text-zinc-300"
        >
          ← Back
        </button>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
} 