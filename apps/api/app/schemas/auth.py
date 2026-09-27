from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_info: dict

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    badge_number: Optional[str] = None
    department: Optional[str] = "Gujarat Police"
    role_name: str = "Investigator"

class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    badge_number: Optional[str] = None
    department: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
