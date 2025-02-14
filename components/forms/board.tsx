"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash,
  GripVertical,
  MoreHorizontal,
  Eye,
  Edit3,
  Plus,
} from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TaskForm from "./task-form";
import { FilterDropdown, SearchFilter } from "@/components/filters";
import useTasks from "@/app/hooks/useTasks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TaskDetail from "@/components/task-details";
import ActivityLog from "@/components/activity-log";
import { Skeleton } from "@/components/ui/skeleton";

export default function Tasks({ user }: { user: any }) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDueDate, setSelectedDueDate] = useState<string>("All");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { tasks, loading, fetchTasks, deleteTask, updateStatus } = useTasks(
    user?.id
  );
  const [sortField, setSortField] = useState<
    "title" | "due_date" | "status" | "category"
  >("due_date");
  useEffect(() => {
    fetchTasks(
      searchQuery,
      selectedCategory,
      selectedDueDate,
      sortField,
      sortDirection
    );
  }, [
    searchQuery,
    selectedCategory,
    selectedDueDate,
    sortField,
    sortDirection,
  ]);

  const statuses = [
    {
      status: "To Do",
      color: "red",
      tasks: tasks.filter((task) => task.status === "To Do"),
    },
    {
      status: "In Progress",
      color: "blue",
      tasks: tasks.filter((task) => task.status === "In Progress"),
    },
    {
      status: "Completed",
      color: "green",
      tasks: tasks.filter((task) => task.status === "Completed"),
    },
  ];
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const onDragStart = (event: { active: any }) => {
    const { active } = event;
    const draggedTask = tasks.find((task) => task.id === active.id);
    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  const onDragEnd = async (event: { active: any; over: any }) => {
    const { active, over } = event;
    if (!over) return;

    const movedTask = tasks.find((task) => task.id === active.id);
    if (!movedTask) return;

    let newStatus = movedTask.status;

    if (over.data.current?.isColumnDropZone) {
      newStatus = over.data.current.status;
    } else if (over.data.current?.isTask) {
      const overTask = tasks.find((task) => task.id === over.id);
      newStatus = overTask?.status || movedTask.status;
    }

    if (newStatus !== movedTask.status) {
      await updateStatus(movedTask.id, newStatus);
    }

    setActiveTask(null);
  };
  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <header className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex-1 bg-white rounded-lg shadow-sm p-4"
            >
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <SearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <div className="flex gap-2">
            <FilterDropdown
              options={[
                { value: "All", label: "All Categories" },
                { value: "Work", label: "Work" },
                { value: "Personal", label: "Personal" },
              ]}
              selectedValue={selectedCategory}
              onChange={setSelectedCategory}
            />

            <FilterDropdown
              options={[
                { value: "All", label: "All Due Dates" },
                { value: "Today", label: "Today" },
                { value: "Tomorrow", label: "Tomorrow" },
                { value: "This Week", label: "This Week" },
                { value: "Overdue", label: "Overdue" },
              ]}
              selectedValue={selectedDueDate}
              onChange={setSelectedDueDate}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          {statuses.map(({ status, color, tasks: statusTasks }) => (
            <StatusColumn
              key={status}
              status={status}
              color={color}
              tasks={statusTasks}
              user={user}
              deleteTask={deleteTask}
            />
          ))}
          <DragOverlay>
            {activeTask ? (
              <div className="bg-white rounded-lg border p-3 shadow-lg w-full flex flex-wrap md:flex-nowrap items-center gap-2">
                <GripVertical
                  size={16}
                  className="text-gray-400 cursor-move hover:text-gray-600 mr-2"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 flex-1 min-w-[120px]">
                      {activeTask.title}
                    </span>
                  </div>
                  <div className="ml-6 mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="text-sm text-gray-500 w-28 text-center hidden sm:block">
                      {new Date(activeTask.due_date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full text-center w-24 ${
                        activeTask.status === "To Do"
                          ? "bg-red-100 text-red-800"
                          : activeTask.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {activeTask.status}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full w-24 text-center hidden sm:block">
                      {activeTask.category}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
export type Task = {
  status: string;
  id: string;
  title: string;
  due_date: string;
  category: string;
  description?: string;
};

export type StatusColumnProps = {
  status: string;
  tasks: Task[];
  color: string;
  user: any;
  deleteTask: (taskId: string) => void;
};
function StatusColumn({
  status,
  tasks,
  user,
  color,
  deleteTask,
}: StatusColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      isColumnDropZone: true,
      status: status,
    },
  });

  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
  const bgColors: Record<StatusColumnProps["status"], string> = {
    "To Do": "bg-red-100",
    "In Progress": "bg-blue-100",
    Completed: "bg-green-100",
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 bg-white rounded-lg shadow-sm ${isOver ? "ring-2 ring-purple-500" : ""}`}
    >
      <div className={`p-4 rounded-t-lg ${bgColors[status]}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">
            {status} ({tasks.length})
          </h3>
          <Dialog
            open={isPlusModalOpen}
            onOpenChange={(open) => setIsPlusModalOpen(open)}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Plus size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl w-full overflow-auto p-6">
              <DialogHeader>
                <DialogTitle>Create a New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new task.
                </DialogDescription>
              </DialogHeader>
              <div className="w-full">
                <TaskForm
                  user={user}
                  onSuccess={() => {
                    setIsPlusModalOpen(false);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-2 min-h-[150px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                user={user}
                task={task}
                deleteTask={deleteTask}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-500">
            Drop here to move to {status}
          </div>
        )}
      </div>
    </div>
  );
}
export type Tasks = {
  id: string;
  title: string;
  status: string;
  due_date: string;
  category: string;
};

export type SortableTaskProps = {
  task: Task;
  deleteTask: (taskId: string) => void;
  user: string;
};
function SortableTask({ task, deleteTask, user }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto", // Ensure the dragged task is above other elements
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow w-full flex flex-wrap md:flex-nowrap items-center gap-2 ${
        isDragging ? "opacity-0" : "opacity-100"
      }`}
    >
      <GripVertical
        size={16}
        className="text-gray-400 cursor-move hover:text-gray-600 mr-2"
        {...listeners}
      />

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800 flex-1 min-w-[120px]">
            {task.title}
          </span>
        </div>
        <div className="ml-6 mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="text-sm text-gray-500 w-28 text-center hidden sm:block">
            {new Date(task.due_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>

          {/* Status Badge */}
          <span
            className={`text-xs px-2 py-1 rounded-full text-center w-24 ${
              task.status === "To Do"
                ? "bg-red-100 text-red-800"
                : task.status === "In Progress"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
            }`}
          >
            {task.status}
          </span>

          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full w-24 text-center hidden sm:block">
            {task.category}
          </span>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Task actions"
            className="text-gray-500 hover:text-gray-700"
          >
            <MoreHorizontal size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-48 p-2">
          <div className="space-y-1">
            {/* View Task */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye size={16} className="mr-2" />
                  View Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Task Details</DialogTitle>
                  <DialogDescription>
                    View the details of this task.
                  </DialogDescription>
                </DialogHeader>
                <TaskDetail taskId={task.id} />
              </DialogContent>
            </Dialog>

            {/* Activity Log */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye size={16} className="mr-2" />
                  Activity Log
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Activity Log</DialogTitle>
                  <DialogDescription>
                    View the activity history for this task.
                  </DialogDescription>
                </DialogHeader>
                <ActivityLog taskId={task.id} />
              </DialogContent>
            </Dialog>

            {/* Edit Task */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-gray-700">
                  <Edit3 size={16} /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl w-full overflow-auto p-6">
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                  <DialogDescription>
                    Edit the task details below.
                  </DialogDescription>
                </DialogHeader>
                <TaskForm
                  taskId={task.id}
                  user={user}
                  onSuccess={() => {
                    setIsModalOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              className="w-full justify-start text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => deleteTask(task.id)}
            >
              <Trash size={16} className="mr-2" />
              Delete Task
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
