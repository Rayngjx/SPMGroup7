import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Active, DataRef, Over } from '@dnd-kit/core';
import { ColumnDragData } from '@/components/kanban/board-column';
import { TaskDragData } from '@/components/kanban/task-card';

type DraggableData = ColumnDragData | TaskDragData;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === 'Column' || data?.type === 'Task') {
    return true;
  }

  return false;
}

export function response<T>(
  data: T | undefined = undefined, // Changed null to undefined
  message: string, // A message summarizing the response
  status: number, // The HTTP status code (e.g., 200, 404, 422)
  error: any = null // The error object if an error occurs
) {
  return {
    status, // HTTP status code
    success: !error, // True if there's no error, false if there's an error
    message, // A short message summarizing the result
    data: data || null, // The data payload, if any (set to null if no data)
    error: error ? { message: error.message || error } : null // Error object, if present
  };
}
