from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import chat, settings as settings_routes
from app.core.database import init_db

app = FastAPI(title="ChatGPTinkered")

# Initialize database tables
init_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(settings_routes.router, prefix="/api/settings", tags=["settings"])

@app.get("/")
async def root():
    return {"message": "Welcome to ChatGPTinkered API"}
