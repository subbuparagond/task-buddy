"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash,
  Plus,
  GripVertical,
  ChevronDown,
  Edit3,
  MoreHorizontal,
  Eye,
  Circle,
  CheckCircle,
  Trash2,
  Clock,
  MoreVertical,
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
  arrayMove,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TaskDetail from "@/components/task-details";
import ActivityLog from "@/components/activity-log";
import useTasks from "@/app/hooks/useTasks";
import { FilterDropdown, SearchFilter } from "@/components/filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Tasks({ user }: { user: any }) {
  const { tasks, loading, fetchTasks, deleteTask, updateStatus } = useTasks(
    user?.id
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDueDate, setSelectedDueDate] = useState<string>("All");
  const [sortField, setSortField] = useState<
    "title" | "due_date" | "status" | "category"
  >("due_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<any | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
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

  const handleSort = (field: "title" | "due_date" | "status" | "category") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const handleSelectTask = (taskId: string, isSelected: boolean) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleBulkUpdateStatus = async (status: string) => {
    for (const taskId of Array.from(selectedTasks)) {
      await updateStatus(taskId, status);
    }
    setSelectedTasks(new Set());
  };

  const handleBulkDelete = async () => {
    for (const taskId of Array.from(selectedTasks)) {
      await deleteTask(taskId);
    }
    setSelectedTasks(new Set());
  };

  const openTaskModal = (task: any) => {
    setSelectedTaskForModal(task);
    setIsModalOpen(true);
  };

  function TaskSkeleton() {
    return (
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
        <Skeleton className="h-5 w-5 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-4 w-[40%]" />
        </div>
        <Skeleton className="h-6 w-20 rounded" />
        <Skeleton className="h-6 w-20 rounded" />
      </div>
    );
  }

  function LoadingSkeleton() {
    return (
      <div className="space-y-4">
        <TaskSkeleton />
        <TaskSkeleton />
        <TaskSkeleton />
      </div>
    );
  }

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
  const onDragStart = (event: any) => {
    const { active } = event;
    const draggedTask = tasks.find((task) => task.id === active.id);
    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const movedTask = tasks.find((task) => task.id === active.id);
    if (!movedTask) return;

    let newStatus = movedTask.status;

    // Check if dropping on a column drop zone
    if (over.data.current?.isColumnDropZone) {
      newStatus = over.data.current.status;
    } else if (over.data.current?.isTask) {
      // Handle task-to-task movement
      const overTask = tasks.find((task) => task.id === over.id);
      newStatus = overTask?.status || movedTask.status;
    }

    if (newStatus !== movedTask.status) {
      // Update the task status if moved to a different column
      await updateStatus(movedTask.id, newStatus);
    } else {
      // Reorder tasks within the same column
      const statusTasks = tasks.filter((task) => task.status === newStatus);
      const oldIndex = statusTasks.findIndex((task) => task.id === active.id);
      const newIndex = statusTasks.findIndex((task) => task.id === over.id);

      if (oldIndex !== newIndex) {
        // Reorder tasks using arrayMove
        const reorderedTasks = arrayMove(statusTasks, oldIndex, newIndex);

        // Update the tasks state with the new order
        const updatedTasks = tasks.map((task) => {
          if (task.status === newStatus) {
            return reorderedTasks.find((t) => t.id === task.id) || task;
          }
          return task;
        });

        // Update the tasks state (frontend-only reordering)
        fetchTasks(
          searchQuery,
          selectedCategory,
          selectedDueDate,
          sortField,
          sortDirection
        );
      }
    }

    setActiveTask(null);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-gray-50">
      <div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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

            {/* Add Task Button */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="mb-6 flex bg-purple-400 items-center gap-2"
                >
                  <Plus size={16} /> ADD TASK
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
                      // Close the dialog when the task is successfully created or updated
                      setIsModalOpen(false);
                      fetchTasks(
                        searchQuery,
                        selectedCategory,
                        selectedDueDate,
                        sortField,
                        sortDirection
                      );
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {selectedTasks.size > 0 && (
          <div className="flex flex-wrap gap-2 justify-between items-center w-full">
            {/* Full buttons for large screens */}
            <div className="hidden sm:flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleBulkUpdateStatus("To Do")}
                className="border-red-500 text-red-600 hover:bg-red-100"
              >
                <Circle size={16} className="mr-2 text-red-500" />
                Mark as To Do
              </Button>

              <Button
                variant="outline"
                onClick={() => handleBulkUpdateStatus("In Progress")}
                className="border-blue-500 text-blue-600 hover:bg-blue-100"
              >
                <Clock size={16} className="mr-2 text-blue-500" />
                Mark as In Progress
              </Button>

              <Button
                variant="outline"
                onClick={() => handleBulkUpdateStatus("Completed")}
                className="border-green-500 text-green-600 hover:bg-green-100"
              >
                <CheckCircle size={16} className="mr-2 text-green-500" />
                Mark as Completed
              </Button>

              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                className="border-red-700 text-red-700 hover:bg-red-100"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Selected
              </Button>
            </div>

            {/* Mobile-friendly dropdown */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreVertical size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleBulkUpdateStatus("To Do")}
                  >
                    <Circle size={16} className="mr-2 text-red-500" />
                    Mark as To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkUpdateStatus("In Progress")}
                  >
                    <Clock size={16} className="mr-2 text-blue-500" />
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkUpdateStatus("Completed")}
                  >
                    <CheckCircle size={16} className="mr-2 text-green-500" />
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleBulkDelete}
                    className="text-red-700"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
        <div className="hidden sm:block bg-gray-50 px-4">
          <div className="w-full flex items-center justify-between text-sm font-medium text-gray-500 border-b border-gray-200 pb-3">
            <div className="w-6 mr-2" />
            <button
              onClick={() => handleSort("title")}
              className="flex-1 text-left flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Task Name
              {sortField === "title" && (
                <ChevronDown
                  size={14}
                  className={`transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </button>
            <button
              onClick={() => handleSort("due_date")}
              className="w-32 text-center flex items-center justify-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Due Date
              {sortField === "due_date" && (
                <ChevronDown
                  size={14}
                  className={`transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </button>
            <button
              onClick={() => handleSort("status")}
              className="w-24 text-center flex items-center justify-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Status
              {sortField === "status" && (
                <ChevronDown
                  size={14}
                  className={`transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </button>
            <button
              onClick={() => handleSort("category")}
              className="w-24 text-center flex items-center justify-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
            >
              Category
              {sortField === "category" && (
                <ChevronDown
                  size={14}
                  className={`transition-transform ${sortDirection === "asc" ? "rotate-180" : ""}`}
                />
              )}
            </button>
            <div className="w-8 ml-2" />
          </div>
        </div>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-500">No tasks available.</p>
        ) : (
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
                updateStatus={updateStatus}
                deleteTask={deleteTask}
                openTaskModal={openTaskModal}
                isModalOpen={isModalOpen}
                selectedTaskForModal={selectedTaskForModal}
                selectedTasks={selectedTasks}
                onSelectTask={handleSelectTask}
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
        )}
      </div>
    </div>
  );
}

type Task = {
  id: string;
  title: string;
  due_date: string;
  category: string;
  status: string;
};

type StatusColumnProps = {
  status: string;
  color: string;
  tasks: Task[];
  user: any;
  deleteTask: (taskId: string) => void;
  updateStatus: (taskId: string, newStatus: string) => void;
  openTaskModal: (task: Task) => void;
  isModalOpen: boolean;
  selectedTaskForModal: Task | null;
};

function StatusColumn({
  status,
  tasks,
  user,
  deleteTask,
  updateStatus,
  openTaskModal,
  isModalOpen,
  selectedTaskForModal,
  selectedTasks,
  onSelectTask,
}: StatusColumnProps & {
  selectedTasks: Set<string>;
  onSelectTask: (taskId: string, isSelected: boolean) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      isColumnDropZone: true,
      status: status,
    },
  });

  const [, setOpen] = useState(false);
  const bgColors: Record<StatusColumnProps["status"], string> = {
    "To Do": "bg-red-100",
    "In Progress": "bg-blue-100",
    Completed: "bg-green-100",
  };
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);

  // Show only the first 5 tasks initially
  const initialTasks = tasks.slice(0, 5);
  const remainingTasks = tasks.slice(5);

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 bg-white rounded-lg shadow-sm ${
        isOver ? "ring-4 ring-purple-500 transition-all duration-200" : ""
      }`}
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
            {/* Display the first 5 tasks */}
            {initialTasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                user={user}
                deleteTask={deleteTask}
                updateStatus={updateStatus}
                openTaskModal={openTaskModal}
                isModalOpen={isModalOpen}
                selectedTaskForModal={selectedTaskForModal}
                isSelected={selectedTasks.has(task.id)}
                onSelectTask={onSelectTask}
              />
            ))}

            {/* Accordion for remaining tasks */}
            {remainingTasks.length > 0 && (
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-sm text-gray-600">
                    Show {remainingTasks.length} more tasks
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {remainingTasks.map((task) => (
                        <SortableTask
                          key={task.id}
                          task={task}
                          user={user}
                          deleteTask={deleteTask}
                          updateStatus={updateStatus}
                          openTaskModal={openTaskModal}
                          isModalOpen={isModalOpen}
                          selectedTaskForModal={selectedTaskForModal}
                          isSelected={selectedTasks.has(task.id)}
                          onSelectTask={onSelectTask}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </SortableContext>

        {/* Empty drop zone */}
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
  due_date: string;
  category: string;
};

export type SortableTaskProps = {
  task: Task;
  user: string;
  openTaskModal: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  isModalOpen: boolean;
  selectedTaskForModal?: Task | null;
  updateStatus: (taskId: string, status: string) => void;
  isSelected: boolean;
  onSelectTask: (taskId: string, isSelected: boolean) => void;
};

function SortableTask({
  task,
  user,
  deleteTask,

  updateStatus,
  isSelected,
  onSelectTask,
}: SortableTaskProps & {
  isSelected: boolean;
  onSelectTask: (taskId: string, isSelected: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className="bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow w-full flex flex-wrap md:flex-nowrap items-center gap-2"
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked: boolean) => onSelectTask(task.id, checked)}
        className="mr-2"
      />

      <GripVertical
        size={16}
        className="text-gray-400 cursor-move hover:text-gray-600 mr-2"
        {...listeners}
      />

      {/* Task Title */}
      <span className="text-sm font-medium text-gray-800 flex-1 min-w-[120px]">
        {task.title}
      </span>

      {/* Status Dropdown */}
      <div className="relative">
        <select
          className="appearance-none border p-2 rounded-lg pl-3 pr-8 text-sm bg-white cursor-pointer"
          value={task.status}
          onChange={(e) => updateStatus(task.id, e.target.value)}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-3 text-gray-500 pointer-events-none"
        />
      </div>

      {/* Due Date */}
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

      {/* Category */}
      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full w-24 text-center hidden sm:block">
        {task.category}
      </span>

      {/* More Options */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40">
          <div className="space-y-2">
            {/* View Task */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-gray-700">
                  <Eye size={16} /> view
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl w-full overflow-auto p-6">
                <DialogHeader>
                  <DialogTitle></DialogTitle>
                  <DialogDescription>Task Details</DialogDescription>
                </DialogHeader>
                <TaskDetail taskId={task.id} />
              </DialogContent>
            </Dialog>

            {/* Activity Log */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-gray-700">
                  <Eye size={16} /> Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl w-full overflow-auto p-6">
                <DialogHeader>
                  <DialogTitle></DialogTitle>
                  <DialogDescription>Activity Details</DialogDescription>
                </DialogHeader>
                <ActivityLog taskId={task.id} />
              </DialogContent>
            </Dialog>

            {/* Edit Task */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
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
                    setIsEditModalOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>

            {/* Delete Task */}
            <Button
              variant="link"
              className="flex w-full text-red-600 hover:text-red-800 items-center gap-2"
              onClick={() => deleteTask(task.id)}
            >
              <Trash size={16} /> Delete
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
