import React, { useState, useEffect } from 'react';
import { createTodo, updateTodo, TodoCreate, TodoUpdate, TodoStatus, TodoPriority } from '../../lib/api/todos';
import { getTags, Tag } from '../../lib/api/tags';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/card';

interface TodoFormProps {
  projectId: string;
  todoId?: string;
  initialData?: {
    title: string;
    description?: string;
    is_completed?: boolean;
    status?: TodoStatus;
    priority?: TodoPriority;
    due_date?: string;
    tag_ids?: string[];
  };
  isEditing?: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

type StatusOption = {
  value: TodoStatus;
  label: string;
}

type PriorityOption = {
  value: TodoPriority;
  label: string;
  color: string;
}

const statusOptions: StatusOption[] = [
  { value: TodoStatus.TODO, label: 'To Do' },
  { value: TodoStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TodoStatus.REVIEW, label: 'In Review' },
  { value: TodoStatus.DONE, label: 'Done' },
];

const priorityOptions: PriorityOption[] = [
  { value: TodoPriority.LOW, label: 'Low', color: '#10B981' },
  { value: TodoPriority.MEDIUM, label: 'Medium', color: '#F59E0B' },
  { value: TodoPriority.HIGH, label: 'High', color: '#EF4444' },
  { value: TodoPriority.URGENT, label: 'Urgent', color: '#7F1D1D' },
];

const TodoForm: React.FC<TodoFormProps> = ({
  projectId,
  todoId,
  initialData,
  isEditing = false,
  onComplete,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isCompleted, setIsCompleted] = useState(initialData?.is_completed || false);
  const [status, setStatus] = useState<TodoStatus>(initialData?.status || TodoStatus.TODO);
  const [priority, setPriority] = useState<TodoPriority>(initialData?.priority || TodoPriority.MEDIUM);
  const [dueDate, setDueDate] = useState<string>(initialData?.due_date?.split('T')[0] || '');
  const [tagIds, setTagIds] = useState<string[]>(initialData?.tag_ids || []);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };

    loadTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && todoId) {
        const data: TodoUpdate = {
          title: title || undefined,
          description: description || undefined,
          is_completed: isCompleted,
          status,
          priority,
          due_date: dueDate || undefined,
          tag_ids: tagIds.length > 0 ? tagIds : undefined,
        };
        await updateTodo(todoId, data);
      } else {
        const data: TodoCreate = {
          title,
          description: description || undefined,
          is_completed: isCompleted,
          status,
          priority,
          due_date: dueDate || undefined,
          project_id: projectId,
          tag_ids: tagIds.length > 0 ? tagIds : undefined,
        };
        await createTodo(data);
      }
      onComplete();
    } catch (error) {
      setError('Failed to save todo');
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Task' : 'Add Task'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`py-2 px-3 rounded border ${
                    status === option.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setStatus(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`py-2 px-3 rounded border ${
                    priority === option.value
                      ? 'bg-gray-100 border-gray-400'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setPriority(option.value)}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.color }}
                    ></div>
                    <span>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-medium">
              Due Date
            </label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <div
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`cursor-pointer px-3 py-1 rounded-full text-sm ${
                      tagIds.includes(tag.id)
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                    }`}
                    style={{ borderLeftColor: tag.color, borderLeftWidth: '4px' }}
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCompleted"
              checked={isCompleted}
              onCheckedChange={(checked) => setIsCompleted(checked)}
            />
            <label htmlFor="isCompleted" className="text-sm font-medium">
              Mark as completed
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
              ? 'Update Task'
              : 'Add Task'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TodoForm;
