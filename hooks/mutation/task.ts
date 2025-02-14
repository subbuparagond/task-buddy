import { useMutation, useQueryClient } from "@tanstack/react-query";
import useSupabaseClient from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useCreateOrUpdateTask() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      taskId,
      taskData,
      attachmentFile,
    }: {
      taskId?: string;
      taskData: any;
      attachmentFile?: File | null;
    }) => {
      let savedTaskId = taskId;

      if (taskId) {
        // Update task
        const { error } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", taskId);
        if (error) throw error;
      } else {
        // Create task
        const { data, error } = await supabase
          .from("tasks")
          .insert(taskData)
          .select("id")
          .single();
        if (error) throw error;
        savedTaskId = data.id;
      }

      // Upload attachment if provided
      if (savedTaskId && attachmentFile) {
        const fileExt = attachmentFile.name.split(".").pop();
        const filePath = `${taskData.user_id}/${savedTaskId}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("task_attachments")
          .upload(filePath, attachmentFile);
        if (uploadError) throw uploadError;

        await supabase
          .from("task_attachments")
          .insert({ task_id: savedTaskId, file_url: filePath });
      }

      return savedTaskId;
    },
    onSuccess: (savedTaskId, { taskData }) => {
      toast({
        title: savedTaskId ? "Task Updated Successfully!" : "Task Created Successfully!",
        description: `Task "${taskData.title}" has been ${
            savedTaskId ? "updated" : "created"
        } successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });

    },
    onError: (error) => {
      toast({
        title: "Error Saving Task",
        description: "There was an issue saving the task. Please try again.",
        variant: "destructive",
      });
    },
  });
}



export function useUpdateProfile() {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      fullname,
      username,
      website,
      avatar_url,
    }: {
      userId: string;
      fullname: string | null;
      username: string | null;
      website: string | null;
      avatar_url: string | null;
    }) => {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: () => {
      toast({
        title: "Error Updating Profile",
        description:
          "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    },
  });
}