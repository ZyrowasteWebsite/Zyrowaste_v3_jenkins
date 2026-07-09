"""Signup, login, forgot password, reset password, and current user."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth_deps import get_current_user
from auth_schemas import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    MessageResponse,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
    UserPublicResponse,
)
from auth_utils import (
    create_access_token,
    hash_password,
    hash_reset_token,
    new_reset_token,
    verify_password,
)
from config import get_settings
from db.models import User
from db.session import get_db

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Register a new user when email and mobile are not already taken."""
    email_norm = str(body.email).lower().strip()
    existing = db.execute(select(User).where(User.email == email_norm)).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    existing_mobile = db.execute(select(User).where(User.mobile == body.mobile)).scalar_one_or_none()
    if existing_mobile is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Mobile number already registered")

    user = User(
        email=email_norm,
        mobile=body.mobile,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user_id=user.id, email=user.email)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Log in an existing user by email and password."""
    email_norm = str(body.email).lower().strip()
    user = db.execute(select(User).where(User.email == email_norm)).scalar_one_or_none()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(user_id=user.id, email=user.email)
    return TokenResponse(access_token=token)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)) -> ForgotPasswordResponse:
    """Issue a one-time reset token (email delivery is optional; see AUTH_DEBUG_RETURN_RESET_TOKEN)."""
    settings = get_settings()
    email_norm = str(body.email).lower().strip()
    user = db.execute(select(User).where(User.email == email_norm)).scalar_one_or_none()
    generic = "If an account exists for that email, password reset instructions have been processed."
    if user is None:
        return ForgotPasswordResponse(message=generic)

    token = new_reset_token()
    user.reset_token_hash = hash_reset_token(token)
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.password_reset_expire_minutes
    )
    db.add(user)
    db.commit()

    if settings.auth_debug_return_reset_token:
        return ForgotPasswordResponse(
            message=generic + " (debug: token returned because AUTH_DEBUG_RETURN_RESET_TOKEN=true)",
            reset_token=token,
            reset_path=f"/reset-password?token={token}",
        )
    return ForgotPasswordResponse(message=generic)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
    """Set a new password using a valid reset token."""
    th = hash_reset_token(body.token.strip())
    user = db.execute(select(User).where(User.reset_token_hash == th)).scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if user is None or user.reset_token_expires is None or user.reset_token_expires < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset link")
    user.password_hash = hash_password(body.new_password)
    user.reset_token_hash = None
    user.reset_token_expires = None
    db.add(user)
    db.commit()
    return MessageResponse(message="Password updated. You can sign in with your new password.")


@router.get("/me", response_model=UserPublicResponse)
def me(user: Annotated[User, Depends(get_current_user)]) -> UserPublicResponse:
    """Return the authenticated user's public profile."""
    last4 = user.mobile[-4:] if len(user.mobile) >= 4 else user.mobile
    return UserPublicResponse(id=user.id, email=user.email, mobile_last4=last4)
