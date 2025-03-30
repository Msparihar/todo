import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, Project, deleteProject } from '../../lib/api/projects';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects(showArchived);
      setProjects(data);
      setError(null);
    } catch (error) {
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [showArchived]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        setProjects(projects.filter((project) => project.id !== id));
      } catch (error) {
        setError('Failed to delete project');
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchProjects}>Try Again</Button>
      </div>
    );
  }

  const activeProjects = projects.filter(project => !project.is_archived);
  const archivedProjects = projects.filter(project => project.is_archived);

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">No projects found. Create your first project!</p>
        <Link to="/projects/new">
          <Button>Create Project</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Projects</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showArchived"
              checked={showArchived}
              onCheckedChange={(checked) => setShowArchived(checked)}
            />
            <label htmlFor="showArchived" className="text-sm font-medium">
              Show Archived
            </label>
          </div>
          <Link to="/projects/new">
            <Button>New Project</Button>
          </Link>
        </div>
      </div>

      {activeProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Active Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <Card key={project.id}>
                <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${project.color || "#4F46E5"}` }}>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    Created on {new Date(project.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {project.description || 'No description provided'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link to={`/projects/${project.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                  <Button variant="destructive" onClick={() => handleDelete(project.id)}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showArchived && archivedProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-500">Archived Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedProjects.map((project) => (
              <Card key={project.id} className="bg-gray-50">
                <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${project.color || "#4F46E5"}` }}>
                  <CardTitle className="text-gray-600">{project.name}</CardTitle>
                  <CardDescription>
                    Created on {new Date(project.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {project.description || 'No description provided'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link to={`/projects/${project.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                  <Button variant="destructive" onClick={() => handleDelete(project.id)}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
