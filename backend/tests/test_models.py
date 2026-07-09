"""Pydantic schema serialization and validation tests."""

import pytest
from pydantic import ValidationError

from models import ChatRequest, ChatResponse, SourceDoc


def test_source_doc_roundtrip() -> None:
    doc = SourceDoc(content="chunk text", metadata={"source": "cert.pdf"})
    dumped = doc.model_dump()
    assert dumped == {"content": "chunk text", "metadata": {"source": "cert.pdf"}}
    assert SourceDoc.model_validate(dumped).content == "chunk text"


def test_chat_request_valid() -> None:
    req = ChatRequest(messages=[{"role": "user", "content": "Hello"}])
    assert req.model_dump() == {"messages": [{"role": "user", "content": "Hello"}]}


def test_chat_request_missing_messages_raises() -> None:
    with pytest.raises(ValidationError) as exc:
        ChatRequest.model_validate({})
    errs = exc.value.errors()
    assert any(e.get("loc") == ("messages",) for e in errs)


def test_chat_response_serialization() -> None:
    resp = ChatResponse(
        reply="Hi",
        sources=[SourceDoc(content="a", metadata={"page": 1})],
    )
    data = resp.model_dump()
    assert data["reply"] == "Hi"
    assert data["sources"][0]["content"] == "a"
    assert data["sources"][0]["metadata"] == {"page": 1}


def test_chat_response_requires_reply_and_sources() -> None:
    with pytest.raises(ValidationError):
        ChatResponse.model_validate({"reply": "x"})
    with pytest.raises(ValidationError):
        ChatResponse.model_validate({"sources": []})
