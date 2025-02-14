import { useQuery } from "@tanstack/react-query";
import useSupabaseClient from "@/utils/supabase/client";

export interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

export function useProfile(userId: string | undefined) {
  const supabase = useSupabaseClient();

  const fetchProfile = async (): Promise<Profile | null> => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  };

  const downloadImage = async (path: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) throw error;
      return URL.createObjectURL(data);
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  };

  return useQuery({
    queryKey: ["profiles", userId],
    queryFn: async () => {
      const profile = await fetchProfile();
      if (!profile) return null;

      const avatarUrl = profile.avatar_url
        ? await downloadImage(profile.avatar_url)
        : null;

      return {
        full_name: profile.full_name,
        avatar_url: avatarUrl,
      };
    },
    enabled: !!userId, // Only run the query if userId is available
  });
}