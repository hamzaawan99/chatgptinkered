# ChatGPTinkered Backend

A FastAPI-based backend service that provides a personal ChatGPT-like experience using Azure OpenAI.

## Features

- **Azure OpenAI Integration**: Uses Azure OpenAI service for chat completions
- **Flexible Database Support**: 
  - Primary: PostgreSQL
  - Fallback: SQLite3 (automatically switches if PostgreSQL is unavailable)
- **Conversation Management**:
  - Persistent chat history
  - Multiple conversation support
  - Message rating system (thumbs up/down)
- **Cost Tracking**:
  - Token counting for both prompts and completions
  - Cost calculation per message
- **Customization**:
  - Support for custom instructions in system prompt
  - Markdown-formatted responses
  - Code syntax highlighting support

## API Endpoints

- `/api/chat/`: Send messages and receive AI responses
- `/api/chat/conversations`: Get list of all conversations
- `/api/chat/conversations/{id}`: Get specific conversation
- `/api/chat/{message_id}/rating`: Rate messages with thumbs up/down
- `/api/settings/custom-instructions`: Manage custom system instructions

## Technologies

- FastAPI
- SQLAlchemy
- Azure OpenAI
- PostgreSQL/SQLite3
- Python 3.10+
