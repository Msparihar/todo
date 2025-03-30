import React, { useState, useEffect } from 'react';
import { getTodosByProject, Todo, updateTodo, deleteTodo, TodoStatus, TodoPriority } from '../../lib/api/todos';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

interface TodoListProps {
  projectId: string;
  onAddTodo: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ projectId, onAddTodo }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TodoStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'all'>('all');

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching todos for project ID: ${projectId}`);
      const data = await getTodosByProject(projectId);
      console.log(`Received ${data.length} todos for project ID: ${projectId}`, data);
      setTodos(data);
      setError(null);
    } catch (error) {
      console.error('Failed to load todos:', error);
      setError('Failed to load todos. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTodos();
    } else {
      console.warn('No project ID provided to TodoList');
      setTodos([]);
    }
  }, [projectId]);

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const updatedTodo = await updateTodo(todo.id, {
        is_completed: !todo.is_completed,
      });
      setTodos(todos.map((t) => (t.id === todo.id ? updatedTodo : t)));
    } catch (error) {
      setError('Failed to update todo');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      setError('Failed to delete todo');
    }
  };

  // Filter todos based on selected filters
  const filteredTodos = todos.filter(todo => {
    if (statusFilter !== 'all' && todo.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && todo.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  // Get status label
  const getStatusLabel = (status: TodoStatus) => {
    switch(status) {
      case TodoStatus.TODO: return 'To Do';
      case TodoStatus.IN_PROGRESS: return 'In Progress';
      case TodoStatus.REVIEW: return 'In Review';
      case TodoStatus.DONE: return 'Done';
      default: return status;
    }
  };

  // Get priority details
  const getPriorityDetails = (priority: TodoPriority) => {
    switch(priority) {
      case TodoPriority.LOW:
        return { label: 'Low', color: '#10B981' };
      case TodoPriority.MEDIUM:
        return { label: 'Medium', color: '#F59E0B' };
      case TodoPriority.HIGH:
        return { label: 'High', color: '#EF4444' };
      case TodoPriority.URGENT:
        return { label: 'Urgent', color: '#7F1D1D' };
      default:
        return { label: 'Medium', color: '#F59E0B' };
    }
  };

  // Format due date
  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // Check if the date is today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Otherwise return formatted date
    return date.toLocaleDateString();
  };

  // Check if a due date is overdue
  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading todos...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchTodos}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tasks</h3>
        <Button onClick={onAddTodo}>Add Task</Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div>
          <label className="text-xs font-medium mb-1 block">Status:</label>
          <select
            className="text-sm border rounded p-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TodoStatus | 'all')}
          >
            <option value="all">All Statuses</option>
            {Object.values(TodoStatus).map(status => (
              <option key={status} value={status}>{getStatusLabel(status)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Priority:</label>
          <select
            className="text-sm border rounded p-1"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(Number(e.target.value) as TodoPriority | 'all')}
          >
            <option value="all">All Priorities</option>
            {Object.values(TodoPriority).filter(p => typeof p === 'number').map(priority => (
              <option key={priority} value={priority}>
                {getPriorityDetails(priority as TodoPriority).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredTodos.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          No tasks match your filters. {todos.length > 0 ? 'Try different filters or add a new task!' : 'Add your first task!'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTodos.map((todo) => {
            const priorityDetails = getPriorityDetails(todo.priority);
            const dueDate = formatDueDate(todo.due_date);
            const dueDateOverdue = isOverdue(todo.due_date);

            return (
              <Card key={todo.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-grow">
                      <div className="pt-1">
                        <Checkbox
                          checked={todo.is_completed}
                          onCheckedChange={() => handleToggleComplete(todo)}
                          className="h-5 w-5"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-medium ${
                              todo.is_completed ? 'line-through text-gray-500' : ''
                            }`}
                          >
                            {todo.title}
                          </p>
                          <div
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: priorityDetails.color }}
                            title={`Priority: ${priorityDetails.label}`}
                          ></div>
                        </div>

                        {todo.description && (
                          <p className="text-sm text-gray-500 mt-1 mb-2">
                            {todo.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-block text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                            {getStatusLabel(todo.status)}
                          </span>

                          {dueDate && (
                            <span
                              className={`inline-block text-xs px-2 py-1 rounded ${
                                dueDateOverdue
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {dueDateOverdue ? '⚠ Due: ' : 'Due: '}{dueDate}
                            </span>
                          )}

                          {todo.tags && todo.tags.length > 0 && todo.tags.map(tag => (
                            <span
                              key={tag.id}
                              className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800"
                              style={{ borderLeftColor: tag.color, borderLeftWidth: '3px' }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(todo.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodoList;
