import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { HandThumbUpIcon, HandThumbDownIcon, ClipboardIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid';

interface Message {
  id: number;
  role: string;
  content: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost: number;
  rating?: number;
}

interface Conversation {
  id: number;
  created_at: string;
  messages: Message[];
}

const ConversationList = ({
  selectedId,
  onSelect,
}: {
  selectedId: number | null;
  onSelect: (id: number) => void;
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const getPreview = (messages: Message[]) => {
    const userMessage = messages.find(m => m.role === 'user');
    return userMessage ? userMessage.content.slice(0, 40) + '...' : 'New conversation';
  };

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={`flex items-center space-x-3 w-full p-3 rounded-lg text-left ${
            selectedId === conv.id ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
        >
          <ChatBubbleLeftIcon className="h-5 w-5 flex-shrink-0" />
          <div className="truncate">
            <p className="text-sm">{getPreview(conv.messages)}</p>
            <p className="text-xs text-gray-400">
              {new Date(conv.created_at).toLocaleDateString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

const Messages = ({ conversationId: initialConversationId }: { conversationId: number | null }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(initialConversationId);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialConversationId) {
      fetchConversation(initialConversationId);
    } else {
      setMessages([]);
      setActiveConversationId(null);
    }
  }, [initialConversationId]);

  const fetchConversation = async (id: number) => {
    try {
      const response = await fetch(`/api/chat/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setActiveConversationId(id);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversation_id: activeConversationId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setActiveConversationId(data.conversation_id);
        setMessages(prev => [...prev, {
          id: data.message.id,
          role: 'user',
          content: input,
          prompt_tokens: data.message.prompt_tokens,
          completion_tokens: 0,
          total_cost: data.message.total_cost,
        }, data.message]);
        setInput('');
      } else {
        console.error('Error:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (messageId: number, rating: number) => {
    try {
      const response = await fetch(`/api/chat/${messageId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, rating } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'user' ? 'bg-blue-100' : 'bg-white shadow'
            }`}
          >
            <div className="prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="relative">
                        <button
                          onClick={() => copyToClipboard(String(children))}
                          className="absolute right-2 top-2 p-2 rounded bg-gray-800 hover:bg-gray-700"
                        >
                          <ClipboardIcon className="h-4 w-4 text-white" />
                        </button>
                        <SyntaxHighlighter
                          language={match[1]}
                          style={atomDark as any}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Tokens: {message.prompt_tokens + message.completion_tokens} (${message.total_cost.toFixed(4)})
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mt-1">
                  <button
                    onClick={() => handleRating(message.id, 100)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    {message.rating === 100 ? (
                      <HandThumbUpSolidIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <HandThumbUpIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRating(message.id, 0)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    {message.rating === 0 ? (
                      <HandThumbDownSolidIcon className="h-5 w-5 text-red-600" />
                    ) : (
                      <HandThumbDownIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

const Chat = {
  Messages,
  ConversationList,
};

export default Chat;
