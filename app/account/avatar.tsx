"use client";
import React, { useEffect, useState } from "react";
import useSupabaseClient from "@/utils/supabase/client";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Avatars({
  uid,
  url,
  size,
  onUpload,
}: {
  uid: string | null;
  url: string | null;
  size: number;
  onUpload: (url: string) => void;
}) {
  const supabase = useSupabaseClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }
        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
      } catch (error) {
        console.log("Error downloading image: ", error);
      }
    }

    if (url) downloadImage(url);
  }, [url, supabase]);

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${uid}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      if (uploadError) {
        throw uploadError;
      }
      onUpload(filePath);
    } catch (error) {
      alert("Error uploading avatar!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4 p-6 bg-white shadow-lg rounded-2xl w-full max-w-sm">
      {/* Avatar (Custom or Default) */}
      <Avatar className="w-[80px] h-[80px] border-4 border-gray-200 shadow-md">
        <AvatarImage
          src={avatarUrl || "https://github.com/shadcn.png"}
          alt="Avatar"
        />
        {/* <AvatarFallback>CN</AvatarFallback> */}
      </Avatar>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="avatar-upload"
        onChange={uploadAvatar}
        disabled={uploading}
      />

      {/* Camera Icon Button (Bottom-Right) */}
      <label
        htmlFor="avatar-upload"
        className="absolute bottom-2 right-2 bg-white border-2 border-gray-300 p-2 rounded-full cursor-pointer shadow-md hover:bg-gray-100 transition"
      >
        <Camera size={20} className="text-gray-700" />
      </label>
    </div>
  );
}
