import { useState } from 'react'
import Chat from './components/Chat'
import Settings from './components/Settings'
import { CogIcon, PlusIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { ThemeProvider, useTheme } from './components/ThemeContext'

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)

  const handleNewChat = () => {
    setSelectedConversationId(null)
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-200 
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`w-64 p-4 flex flex-col h-screen border-r
        ${theme === 'dark' ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        <button
          onClick={handleNewChat}
          className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg border mb-4
            ${theme === 'dark' 
              ? 'border-gray-600 hover:bg-gray-700' 
              : 'border-gray-300 hover:bg-gray-200'}`}
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Chat</span>
        </button>
        <div className="flex-1 overflow-y-auto">
          <Chat.ConversationList
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>
        <div className="space-y-2">
          <button
            onClick={toggleTheme}
            className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg
              ${theme === 'dark' 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-200'}`}
          >
            {theme === 'dark' ? (
              <>
                <SunIcon className="h-5 w-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <MoonIcon className="h-5 w-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center space-x-2 w-full px-4 py-2 rounded-lg
              ${theme === 'dark' 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-200'}`}
          >
            <CogIcon className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        {showSettings ? (
          <div className="p-8">
            <Settings onClose={() => setShowSettings(false)} />
          </div>
        ) : (
          <Chat.Messages conversationId={selectedConversationId} />
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App
