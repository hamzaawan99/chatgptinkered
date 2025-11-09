from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    conversation_id: int
    created_at: datetime
    prompt_tokens: int
    completion_tokens: int
    total_cost: float
    rating: Optional[int] = None

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    pass

class ConversationCreate(ConversationBase):
    pass

class Conversation(ConversationBase):
    id: int
    created_at: datetime
    messages: List[Message]

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    conversation_id: int
    message: Message

class RatingUpdate(BaseModel):
    rating: int  # 0 for thumbs down, 100 for thumbs up
