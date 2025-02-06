"use client";

import { useState } from "react";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { upload } from "thirdweb/storage";
import { client, contract } from "@/app/client";

export default function PostForm() {
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!account || !content) return;
    
    setIsSubmitting(true);
    try {
      let ipfsHash = "";
      
      // Upload image if exists
      if (imageFile) {
        const result = await upload({ client, files: [imageFile] });
        ipfsHash = result.split("ipfs://")[1];
      }

      // If content > 280 chars, store in IPFS
      let contentToStore = content;
      let contentIpfsHash = "";
      if (content.length > 280) {
        const textFile = new File([content], "content.txt", { type: "text/plain" });
        const result = await upload({ client, files: [textFile] });
        contentIpfsHash = result.split("ipfs://")[1];
        contentToStore = ""; // Clear on-chain content
      }

      await sendTransaction(
        prepareContractCall({
          contract,
          method: "function createPost(string,string)",
          params: [contentToStore, imageFile ? ipfsHash : ""]
        })
      );
      
      setContent("");
      setImageFile(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none"
        rows={3}
      />
      <div className="flex items-center justify-between mt-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
} 