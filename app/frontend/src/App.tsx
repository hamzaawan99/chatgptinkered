import { useState } from 'react'
import Chat from './components/Chat'
import Settings from './components/Settings'
import { CogIcon, PlusIcon } from '@heroicons/react/24/outline'

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null)

  const handleNewChat = () => {
    setSelectedConversationId(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col h-screen">
        <button
          onClick={handleNewChat}
          className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 mb-4"
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
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg hover:bg-gray-700 mt-4"
        >
          <CogIcon className="h-5 w-5" />
          <span>Settings</span>
        </button>
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

export default App
