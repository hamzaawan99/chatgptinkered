from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Azure OpenAI Settings
    AZURE_OPENAI_API_KEY: str
    AZURE_OPENAI_ENDPOINT: str
    AZURE_OPENAI_MODEL_NAME: str

    # Database Settings
    DATABASE_URL: str
    SQLITE_URL: str = "sqlite:///./chat.db"
    
    # Custom Instructions
    CUSTOM_INSTRUCTIONS: Optional[str] = ""

    class Config:
        env_file = ".env"

settings = Settings()

# System prompt template
SYSTEM_PROMPT = f"""You are a highly capable AI assistant designed to help with a wide range of tasks. 
{settings.CUSTOM_INSTRUCTIONS}

Guidelines for responses:
1. Format: Provide responses in Markdown format for better readability
2. Code: When sharing code:
   - Use appropriate language-specific markdown code blocks
   - Include helpful comments
   - Follow best practices and conventions
3. Explanations: Be clear, concise, and thorough
4. Citations: Reference sources when applicable
5. Limitations: Be honest about limitations or uncertainties
6. Follow-up: Encourage questions for clarification when needed

Remember to be helpful, accurate, and ethical in all interactions."""
