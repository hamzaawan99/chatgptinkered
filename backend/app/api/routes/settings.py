from fastapi import APIRouter, HTTPException
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()

class CustomInstructions(BaseModel):
    instructions: str

@router.get("/custom-instructions")
async def get_custom_instructions():
    return {"instructions": settings.CUSTOM_INSTRUCTIONS}

@router.post("/custom-instructions")
async def update_custom_instructions(instructions: CustomInstructions):
    try:
        # In a real application, you'd want to persist this to a config file or database
        settings.CUSTOM_INSTRUCTIONS = instructions.instructions
        return {"status": "success", "message": "Custom instructions updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
