import React from 'react';
import { useAuth } from '../contexts/auth-context';
import TagManager from '../components/tags/tag-manager';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.username || 'User'}
            </span>
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
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium leading-6 text-gray-900">Tag Management</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Create and manage tags to organize your tasks.
                </p>
              </div>
              <TagManager />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
