"use client";
import { useState } from "react";
import AuthButton from "@/components/header-auth";
import { Button } from "@/components/ui/button";
import { LayoutList, LayoutGrid, CheckCircle } from "lucide-react";
import TasksBoard from "./board";
import TasksList from "./task-list";

export default function Tasks({ user }: { user: any }) {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-purple-900 flex items-center gap-2">
          <CheckCircle size={30} className="text-purple-900" /> TaskBuddy
        </h1>
        <AuthButton />
      </header>

      <div className="flex flex-wrap gap-2 md:gap-4 mb-6">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => setViewMode("list")}
          className="flex items-center gap-2 px-3 py-2 text-sm md:text-base"
          title="List View"
        >
          <LayoutList size={20} />
          <span className="hidden sm:inline-flex">List View</span>
        </Button>
        <Button
          variant={viewMode === "board" ? "default" : "outline"}
          onClick={() => setViewMode("board")}
          className="flex items-center gap-2 px-3 py-2 text-sm md:text-base"
          title="Board View"
        >
          <LayoutGrid size={20} />
          <span className="hidden sm:inline-flex">Board View</span>
        </Button>
      </div>

      <div className="w-full overflow-x-auto">
        {viewMode === "list" ? (
          <TasksList user={user} />
        ) : (
          <TasksBoard user={user} />
        )}
      </div>
    </div>
  );
}
