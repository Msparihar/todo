import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../lib/api/projects';
import ProjectForm from '../components/projects/project-form';

const ProjectFormPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<{ name: string; description: string } | undefined>();
  const [isLoading, setIsLoading] = useState(!!projectId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      try {
        const project = await getProject(projectId);
        setInitialData({
          name: project.name,
          description: project.description,
        });
      } catch (_) {
        setError('Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="px-4 py-8 sm:px-0">
          <ProjectForm
            projectId={projectId}
            initialData={initialData}
            isEditing={!!projectId}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectFormPage;
