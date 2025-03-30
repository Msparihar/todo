import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject, updateProject, ProjectCreate, ProjectUpdate } from '../../lib/api/projects';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../ui/card';

interface ProjectFormProps {
  projectId?: string;
  initialData?: {
    name: string;
    description: string;
    color?: string;
    is_archived?: boolean;
  };
  isEditing?: boolean;
}

// Define some preset colors
const colorPresets = [
  "#4F46E5", // Indigo
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#EC4899", // Pink
];

const ProjectForm: React.FC<ProjectFormProps> = ({
  projectId,
  initialData,
  isEditing = false,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [color, setColor] = useState(initialData?.color || "#4F46E5");
  const [isArchived, setIsArchived] = useState(initialData?.is_archived || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && projectId) {
        const data: ProjectUpdate = {
          name: name || undefined,
          description: description || undefined,
          color,
          is_archived: isArchived,
        };
        await updateProject(projectId, data);
      } else {
        const data: ProjectCreate = {
          name,
          description: description || undefined,
          color,
          is_archived: isArchived,
        };
        await createProject(data);
      }
      navigate('/');
    } catch (err) {
      setError('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Project' : 'Create Project'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Project Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <label className="text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={`w-8 h-8 rounded-full ${color === presetColor ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setColor(presetColor)}
                  aria-label={`Select color ${presetColor}`}
                />
              ))}
            </div>
          </div>
          {isEditing && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isArchived"
                checked={isArchived}
                onCheckedChange={(checked) => setIsArchived(checked as boolean)}
              />
              <label htmlFor="isArchived" className="text-sm font-medium">
                Archive this project
              </label>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
              ? 'Update Project'
              : 'Create Project'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProjectForm;
