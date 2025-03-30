import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import ProjectList from '../components/projects/project-list';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Todo App</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username || 'User'}
            </span>
            <Link to="/settings" className="text-sm text-blue-600 hover:text-blue-800">
              Settings
            </Link>
            <button
              onClick={logout}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <ProjectList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
