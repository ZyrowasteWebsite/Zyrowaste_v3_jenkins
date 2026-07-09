"""Pydantic schemas for authentication endpoints."""

from __future__ import annotations

import re

from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    """New user registration; email and mobile are required."""

    email: EmailStr
    mobile: str = Field(..., min_length=10, max_length=20)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("mobile")
    @classmethod
    def normalize_mobile(cls, v: str) -> str:
        raw = re.sub(r"\s+", "", v.strip())
        digits = re.sub(r"\D", "", raw)
        if len(digits) >= 12 and digits.startswith("91"):
            digits = digits[-10:]
        if len(digits) != 10 or digits[0] not in "6789":
            raise ValueError("Use a valid 10-digit Indian mobile (starting 6–9).")
        return digits


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=256)
    new_password: str = Field(..., min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str | None = None
    reset_path: str | None = Field(
        default=None,
        description="Hash path for frontend when debug token is returned.",
    )


class UserPublicResponse(BaseModel):
    id: int
    email: EmailStr
    mobile_last4: str
