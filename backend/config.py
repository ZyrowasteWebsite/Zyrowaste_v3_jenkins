"""Application settings loaded from environment / .env."""

from functools import lru_cache

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    groq_api_key: str = Field(..., alias="GROQ_API_KEY")
    llm_model: str = Field(default="llama-3.3-70b-versatile", alias="LLM_MODEL")
    cors_origins: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")
    jwt_secret: str = Field(
        default="dev-only-change-JWT_SECRET-in-production",
        alias="JWT_SECRET",
    )
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=10080, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    password_reset_expire_minutes: int = Field(default=60, alias="PASSWORD_RESET_EXPIRE_MINUTES")
    auth_debug_return_reset_token: bool = Field(
        default=False,
        alias="AUTH_DEBUG_RETURN_RESET_TOKEN",
    )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
