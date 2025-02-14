"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useCreateOrUpdateTask } from "@/hooks/mutation/task";
import { useGetTask } from "@/hooks/query/task";
import useSupabaseClient from "@/utils/supabase/client";

type TaskFormProps = {
  user: any;
  taskId?: string;
  onSuccess?: () => void;
};

export default function TaskForm({ user, taskId, onSuccess }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Work" | "Personal" | "">("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<
    "To Do" | "In Progress" | "Completed" | ""
  >("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  const { data: tasks } = useGetTask(taskId || "");
  const supabase = useSupabaseClient();
  const task = tasks;

  const submitMutation = useCreateOrUpdateTask();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setCategory(task.category);
      setDueDate(task.due_date);
      setStatus(task.status);

      if (task.task_attachments.length > 0) {
        const filePath = task.task_attachments[0].file_url;

        downloadAttachment(filePath);
      }
    }
  }, [task]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setAttachmentFile(file);
    setAttachmentUrl(URL.createObjectURL(file));
  };

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

  const handleSave = () => {
    const taskData = {
      user_id: user.id,
      title,
      description,
      category,
      due_date: dueDate,
      status,
    };

    const mutation = submitMutation;
    mutation.mutate(
      { taskId, taskData, attachmentFile },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <div>
      <Card className="w-full max-w-2xl p-6 bg-white rounded-xl shadow-md">
        <CardContent className="flex flex-col space-y-4">
          <Input
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-4">
            <Button
              variant="outline"
              className={category === "Work" ? "bg-gray-200" : ""}
              onClick={() => setCategory("Work")}
            >
              Work
            </Button>
            <Button
              variant="outline"
              className={category === "Personal" ? "bg-gray-200" : ""}
              onClick={() => setCategory("Personal")}
            >
              Personal
            </Button>
          </div>

          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Select
            value={status}
            onValueChange={(val) =>
              setStatus(val as "To Do" | "In Progress" | "Completed")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {attachmentUrl && (
            <div className="relative w-full h-40">
              <Image
                src={attachmentUrl}
                alt="Attachment Preview"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          )}

          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-blue-600 flex items-center gap-2"
          >
            <Camera className="h-5 w-5" /> Upload Attachment
          </label>

          <div className="flex justify-end gap-2">
            <Button className="bg-purple-600 text-white" onClick={handleSave}>
              {submitMutation?.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
