"use client";

import { useEffect, useState } from "react";
import useSupabaseClient from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Image from "next/image";

type TaskDetailProps = {
  taskId: string;
};

export default function TaskDetail({ taskId }: TaskDetailProps) {
  const supabase = useSupabaseClient();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const fetchTaskDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*, task_tags(tag), task_attachments(file_url)")
        .eq("id", taskId)
        .single();

      if (error) {
        console.error("Error fetching task details:", error);
      } else {
        setTask(data);
        if (data.task_attachments.length > 0) {
          downloadAttachment(data.task_attachments[0].file_url);
        }
      }
      setLoading(false);
    };

    fetchTaskDetails();
  }, [taskId, supabase]);

  const downloadAttachment = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("task_attachments")
        .download(filePath);
      if (error) throw error;
      setAttachmentUrl(URL.createObjectURL(data));
    } catch (error) {
      console.error("Error downloading attachment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );
  }

  if (!task) {
    return <p className="text-center text-red-500">Task not found.</p>;
  }

  return (
    <Card className="w-full max-w-4xl p-4 sm:p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <CardContent className="space-y-6">
        {/* Task Name */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            {task.title}
          </h2>
        </div>

        {/* Task Description */}
        <p className="text-sm sm:text-base text-gray-600">{task.description}</p>

        {/* Task Labels (Status, Category, Due Date) */}
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <span className="px-3 py-1 rounded-md bg-purple-100 text-purple-700">
            {task.status}
          </span>
          <span className="px-3 py-1 rounded-md bg-gray-200">
            {task.category}
          </span>
          <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-700">
            Due:{" "}
            {new Date(task.due_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          
        </div>

        {/* Task Attachments Preview */}
        {attachmentUrl && (
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-md h-48 sm:h-60">
              <Image
                src={attachmentUrl}
                alt="Attachment Preview"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
