import React, { useState, useEffect } from 'react';
import { getTags, createTag, deleteTag, Tag, TagCreate } from '../../lib/api/tags';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';

const TagManager: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4F46E5');
  const [isCreating, setIsCreating] = useState(false);

  // Predefined colors
  const colorPresets = [
    "#4F46E5", // Indigo
    "#06B6D4", // Cyan
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#EC4899", // Pink
  ];

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const data = await getTags();
      setTags(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsCreating(true);
    try {
      const tagData: TagCreate = {
        name: newTagName.trim(),
        color: newTagColor
      };
      const newTag = await createTag(tagData);
      setTags([...tags, newTag]);
      setNewTagName('');
      setNewTagColor('#4F46E5');
      setError(null);
    } catch (err) {
      setError('Failed to create tag');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await deleteTag(id);
        setTags(tags.filter(tag => tag.id !== id));
      } catch (err) {
        setError('Failed to delete tag');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading tags...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Tags</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateTag} className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="tagName" className="text-sm font-medium">
              New Tag Name
            </label>
            <Input
              id="tagName"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium block">Color</label>
            <div className="flex gap-1">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full ${newTagColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTagColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
          <Button type="submit" disabled={isCreating || !newTagName.trim()}>
            {isCreating ? 'Creating...' : 'Add Tag'}
          </Button>
        </form>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Your Tags</h3>
          {tags.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tags yet. Create your first tag!</p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <span>{tag.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagManager;
