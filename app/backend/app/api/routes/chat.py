from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.config import settings, SYSTEM_PROMPT
from app.models.chat import Conversation, Message
from app.schemas.chat import ChatRequest, ChatResponse, RatingUpdate, Conversation as ConversationSchema
from openai import AzureOpenAI
import openai
import tiktoken

router = APIRouter()

# Configure Azure OpenAI
openai.api_type = "azure"
openai.api_key = settings.AZURE_OPENAI_API_KEY
openai.api_base = settings.AZURE_OPENAI_ENDPOINT
openai.api_version = "2023-07-01-preview"

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=settings.AZURE_OPENAI_API_KEY,
    api_version="2024-08-01-preview",  # latest stable version for gpt-4.1
    azure_endpoint=settings.AZURE_OPENAI_ENDPOINT
)

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    # Get or create conversation
    if request.conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == request.conversation_id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation()
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Build message history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in conversation.messages:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})

    try:
        # Call Azure OpenAI API
        response = client.chat.completions.create(
            model=settings.AZURE_OPENAI_MODEL_NAME,  # "gpt-4.1"
            messages=messages,
            temperature=0.7,
        )

        # Extract token usage
        usage = response.usage
        prompt_tokens = usage.prompt_tokens
        completion_tokens = usage.completion_tokens
        total_tokens = usage.total_tokens

        # Define pricing fot gpt-4.1
        INPUT_COST = 0.0020 / 1000    # $0.0020 per 1k tokens (prompt) - From Azure Pricing Calculator
        OUTPUT_COST = 0.0080 / 1000   # $0.0080 per 1k tokens (completion) - From Azure Pricing Calculator

        total_cost = (prompt_tokens * INPUT_COST) + (completion_tokens * OUTPUT_COST)

        # Save user message
        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content=request.message,
            prompt_tokens=prompt_tokens,
            completion_tokens=0,
            total_cost=prompt_tokens * INPUT_COST,
        )
        db.add(user_message)

        # Save assistant message
        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=response.choices[0].message.content,
            prompt_tokens=0,
            completion_tokens=response.usage.completion_tokens,
            total_cost=response.usage.completion_tokens * OUTPUT_COST,
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(assistant_message)

        return ChatResponse(
            conversation_id=conversation.id,
            message=assistant_message
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{message_id}/rating")
async def rate_message(
    message_id: int,
    rating: RatingUpdate,
    db: Session = Depends(get_db)
):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.rating = rating.rating
    db.commit()
    return {"status": "success"}

@router.get("/conversations", response_model=List[ConversationSchema])
async def get_conversations(db: Session = Depends(get_db)):
    conversations = db.query(Conversation).order_by(Conversation.created_at.desc()).all()
    return conversations

@router.get("/conversations/{conversation_id}", response_model=ConversationSchema)
async def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation
