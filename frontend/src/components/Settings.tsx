import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';

interface SettingsProps {
  onClose: () => void;
}

const Settings = ({ onClose }: SettingsProps) => {
  const { theme } = useTheme();
  const [instructions, setInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInstructions();
  }, []);

  const fetchInstructions = async () => {
    try {
      const response = await fetch('/api/settings/custom-instructions');
      const data = await response.json();
      setInstructions(data.instructions || '');
    } catch (error) {
      console.error('Error fetching instructions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/settings/custom-instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructions }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(onClose, 1500);
      } else {
        setMessage(data.detail || 'Error saving settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`rounded-lg shadow p-6 ${
      theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'
    }`}>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Custom Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className={`w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
            placeholder="Add your custom instructions here..."
          />
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            These instructions will be added to the system prompt for all conversations.
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('Error') 
              ? theme === 'dark' ? 'bg-red-900 bg-opacity-50 text-red-200' : 'bg-red-100 text-red-700'
              : theme === 'dark' ? 'bg-green-900 bg-opacity-50 text-green-200' : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded transition-colors ${
              theme === 'dark' 
                ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50`}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
