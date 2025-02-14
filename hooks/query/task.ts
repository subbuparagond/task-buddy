import { useQuery } from "@tanstack/react-query";
import useSupabaseClient from "@/utils/supabase/client";

export function useGetTask(taskId: string) {
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, task_tags(tag), task_attachments(file_url)")
        .eq("id", taskId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!taskId, 
  });
}


export function useGetProfile(userId: string | undefined) {
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select(`full_name, username, website, avatar_url`)
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId, 
  });
}

  
