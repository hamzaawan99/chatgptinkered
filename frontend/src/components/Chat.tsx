import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { HandThumbUpIcon, HandThumbDownIcon, ClipboardIcon, ChatBubbleLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useTheme } from './ThemeContext';
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
  const { theme } = useTheme();

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
            theme === 'dark'
              ? selectedId === conv.id ? 'bg-gray-700' : 'hover:bg-gray-700'
              : selectedId === conv.id ? 'bg-gray-200' : 'hover:bg-gray-200'
          }`}
        >
          <ChatBubbleLeftIcon className="h-5 w-5 flex-shrink-0" />
          <div className="truncate">
            <p className="text-sm">{getPreview(conv.messages)}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(conv.created_at).toLocaleDateString()}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

const Messages = ({ conversationId: initialConversationId }: { conversationId: number | null }) => {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(initialConversationId);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  };

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
      const response = await fetch('/api/chat/', {
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
        adjustTextareaHeight();
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
    <div className="flex flex-col h-screen">
      <div 
        ref={messageContainerRef} 
        className={`flex-1 overflow-y-auto pb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}
      >
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${message.role === 'user'
                    ? theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100'
                    : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  {message.role === 'user' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className={`flex flex-col space-y-1 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500 text-white'
                      : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
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
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tokens: {message.prompt_tokens + message.completion_tokens} (${message.total_cost.toFixed(4)})
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mt-1">
                        <button
                          onClick={() => handleRating(message.id, 100)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                          {message.rating === 100 ? (
                            <HandThumbUpSolidIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <HandThumbUpIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleRating(message.id, 0)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
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
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) handleSubmit(e);
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className={`w-full p-4 pr-12 rounded-xl resize-none overflow-hidden border focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                style={{
                  minHeight: '3rem',
                  maxHeight: '150px',
                }}
              />
              <button
                type="submit"
                className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors
                  ${isLoading || !input.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'text-blue-400 hover:bg-gray-600'
                      : 'text-blue-600 hover:bg-gray-100'
                  }`}
                disabled={isLoading || !input.trim()}
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Chat = {
  Messages,
  ConversationList,
};

export default Chat;
