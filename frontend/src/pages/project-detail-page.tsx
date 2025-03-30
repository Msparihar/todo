import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, Project } from '../lib/api/projects';
import TodoList from '../components/todos/todo-list';
import TodoForm from '../components/todos/todo-form';
import { Button } from '../components/ui/button';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingTodo, setIsAddingTodo] = useState(false);

  // Log the projectId when it changes
  useEffect(() => {
    console.log("ProjectDetailPage - Current projectId:", projectId);
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) {
      console.error("No projectId available");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching project details for:", projectId);
      const data = await getProject(projectId);
      console.log("Project data received:", data);
      setProject(data);
      setError(null);
    } catch (error) {
      setError('Failed to load project');
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="mt-1 text-sm text-gray-600">{project.description}</p>
              )}
            </div>
            <div className="flex space-x-4">
              <Link to={`/projects/${projectId}/edit`}>
                <Button variant="outline">Edit Project</Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
              <Link to="/">
                <Button variant="ghost">Back to Projects</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {isAddingTodo ? (
              <TodoForm
                projectId={projectId as string}
                onComplete={() => {
                  setIsAddingTodo(false);
                  fetchProject();
                }}
                onCancel={() => setIsAddingTodo(false)}
              />
            ) : (
              <TodoList
                projectId={projectId as string}
                onAddTodo={() => setIsAddingTodo(true)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetailPage;
