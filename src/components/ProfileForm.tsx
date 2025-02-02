"use client";

import { useState, useMemo } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall, resolveMethod } from "thirdweb";
import { upload } from "thirdweb/storage";
import { client, contract } from "@/app/client";

interface ProfileFormProps {
  existingProfile?: {
    name: string;
    bio: string;
    handle: string;
    avatar?: string;
  };
}

export default function ProfileForm({ existingProfile }: ProfileFormProps) {
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction, data: transactionResult } = useSendTransaction();
  
  const [handle, setHandle] = useState(existingProfile?.handle || "");
  const [name, setName] = useState(existingProfile?.name || "");
  const [bio, setBio] = useState(existingProfile?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let avatarHash = existingProfile?.avatar || "";

      if (avatarFile) {
        const uploadResult = await upload({
          client,
          files: [avatarFile],
        });
        avatarHash = uploadResult.split("ipfs://")[1];
        console.log(uploadResult);
        console.log(avatarHash);
      }

      const transaction = prepareContractCall({
        contract,
        method: resolveMethod(
          existingProfile ? "updateProfile" : "createProfile"
        ),
        params: existingProfile
          ? [name, bio, avatarHash]
          : [handle, name, bio, avatarHash]
      });


      console.log("transacting", transaction);

      const result = await sendTransaction(transaction);
      console.log(result);

    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Profile creation failed. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewAvatar = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    if (existingProfile?.avatar) return `https://ipfs.io/ipfs/${existingProfile.avatar}`;
    return null;
  }, [avatarFile, existingProfile?.avatar]);

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Avatar
          </label>
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full overflow-hidden bg-zinc-800">
              {previewAvatar && (
                <img
                  src={previewAvatar}
                  alt="Avatar preview"
                  className="object-cover size-full"
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700"
            />
          </div>
        </div>

        {!existingProfile && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-800 rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-zinc-800 rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : existingProfile ? "Update Profile" : "Create Profile"}
        </button>
      </div>
    </form>
  );
} 