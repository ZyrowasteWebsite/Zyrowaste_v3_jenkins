"""Ultra-light chat pipeline: direct Groq API call (no vector DB runtime)."""

from __future__ import annotations

import json

import httpx
from config import get_settings

SYSTEM_PROMPT = """You are the AI assistant for Swaroop Formulation Industries Pvt. Ltd., a biodegradable plastic bag manufacturing company based in Unnao, Uttar Pradesh, India.

Use the company facts below when relevant. If exact data is not available, say that clearly.

KEY FACTS:
- Products: PLA-based biodegradable bags for groceries, food packaging, agricultural mulch films, and biomedical waste.
- Standards: IS 17088:2019, ASTM D6400, EN 13432, ISO 17088:2021.
- Certifications: ISO 9001:2015 (QSR/QS/2603392923, expires 22-03-2029), ISO 13485:2016 (IN01232718, expires 24-03-2029).
- Scope: Manufacturing of Plastic Bio Medical and Bio Degradable Compostable Waste Bags and Other Packaging Goods.
- Location: Chukkusehri, Hasanganj, Unnao, Uttar Pradesh 209841, India.

FINANCIAL PROJECTIONS (INR Lakhs):
- Year 1: Sales 95.76, EBITDA ~10.5, Net Profit 4.74, ROI 20%, DSCR 3.05
- Year 3: Sales 127.98, EBITDA ~14.2, Net Profit 8.93, ROI 32%, DSCR 3.13
- Year 5: Sales 158.63, EBITDA ~18.5, Net Profit 13.31, ROI 45%, DSCR 4.91

MARKET CONTEXT:
- Global biodegradable plastics market: USD 12.2B by 2030 at 9.2% CAGR.
- India ranks top 10 in consumption but imports 70% of supply.
- Key competitors: Ecolastic (Hyderabad), Biogreen Bags (Bengaluru), Truegreen (Mumbai), NaturTrust (Noida).
- International: BASF (ecovio), Novamont (Mater-Bi), NatureWorks (Ingeo PLA).

TECHNOLOGY: Vertical Blender -> Plastic Extruder & Blow Film Machine -> Printing -> Cutting & Sealing.

RAW MATERIALS: PLA blends compounded with UV stabilizers, color pigments, and additives.

REGULATORY: GST registered, Udyam MSME, PCB NOC, Fire Safety NOC, Trade License.

FUTURE SCOPE: Diversification into cutlery/films, EU/ASEAN exports, carbon-credit linkages, methane-fed PHA research.

Respond concisely, professionally, and helpfully. Use bullet points for lists and mention numbers where relevant.
"""


def _normalize_messages(messages: list[dict[str, str]]) -> list[dict[str, str]]:
    """Keep only valid OpenAI-compatible message roles/content."""
    out: list[dict[str, str]] = []
    for msg in messages:
        role = str(msg.get("role", "")).lower()
        content = str(msg.get("content", "")).strip()
        if role not in {"user", "assistant"} or not content:
            continue
        out.append({"role": role, "content": content})
    if not out:
        out.append(
            {
                "role": "user",
                "content": "Give a short, helpful overview of Swaroop Formulation Industries for a new visitor.",
            }
        )
    return out


async def get_rag_response(messages: list[dict[str, str]]) -> dict:
    """Call Groq chat completion directly. Keeps API contract unchanged."""
    settings = get_settings()
    chat_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    chat_messages.extend(_normalize_messages(messages))

    payload = {
        "model": settings.llm_model,
        "messages": chat_messages,
        "temperature": 0.2,
        "max_tokens": 900,
    }
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            content=json.dumps(payload),
        )
        resp.raise_for_status()
        data = resp.json()
    reply_text = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "No response generated.")
    )

    # Keep response schema same as before.
    return {"reply": str(reply_text), "sources": []}
