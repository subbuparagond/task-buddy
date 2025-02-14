import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import useSupabaseClient from "@/utils/supabase/client";

export interface Task {
  id: string;
  title: string;
  due_date: string;
  status: string;
  category: string;
  task_tags: { tag: string }[];
}

export default function useTasks(userId: string) {
  const supabase = useSupabaseClient();
  const router = useRouter(); // Initialize router
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async (
    searchQuery: string,
    selectedCategory: string,
    selectedDueDate: string,
    sortField: "title" | "due_date" | "status" | "category",
    sortDirection: "asc" | "desc"
  ) => {
    if (!userId) return;

    try {
      let query = supabase
        .from("tasks")
        .select("id, title, due_date, status, category, task_tags(tag)")
        .eq("user_id", userId);

      if (searchQuery) query = query.ilike("title", `%${searchQuery}%`);
      if (selectedCategory !== "All")
        query = query.eq("category", selectedCategory);

      const today = new Date().toISOString().split("T")[0];
      switch (selectedDueDate) {
        case "Today":
          query = query.eq("due_date", today);
          break;
        case "Tomorrow":
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          query = query.eq("due_date", tomorrow.toISOString().split("T")[0]);
          break;
        case "This Week":
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          query = query
            .gte("due_date", startOfWeek.toISOString().split("T")[0])
            .lte("due_date", endOfWeek.toISOString().split("T")[0]);
          break;
        case "Overdue":
          query = query.lt("due_date", today).neq("status", "Completed");
          break;
      }

      const { data: tasksData, error } = await query.order(sortField, {
        ascending: sortDirection === "asc",
      });

      if (error) throw error;
      setTasks(tasksData || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateStatus = async (taskId: string, newStatus: string ) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);
      if (error) throw error;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      router.push("/home"); 
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return {
    tasks,
    loading,
    fetchTasks,
    deleteTask,
    updateStatus,
  };
}
