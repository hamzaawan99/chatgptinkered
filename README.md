# ChatGPTinkered

A personal ChatGPT-like application using Azure OpenAI, with a FastAPI backend and React frontend.

## Overview

ChatGPTinkered is a self-hosted chat application that provides a ChatGPT-like experience using your own Azure OpenAI API key. It includes conversation management, cost tracking, and custom instruction support.

## Project Structure

```
chatgptinkered/
├── backend/          # FastAPI backend service
├── frontend/        # React frontend (Vite)
└── docker-compose.yml
```

See individual README files in backend and frontend directories for specific component details.

## Features

- Azure OpenAI integration
- Conversation history
- Message rating system
- Token counting and cost tracking
- Code syntax highlighting
- Custom instructions support
- Database fallback mechanism (PostgreSQL → SQLite3)

## Technologies

- Backend: FastAPI, SQLAlchemy, Azure OpenAI
- Frontend: React, TypeScript, Vite, TailwindCSS
- Database: PostgreSQL/SQLite3
- Container: Docker

## License

MIT
