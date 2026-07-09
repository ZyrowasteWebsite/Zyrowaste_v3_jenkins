"""LLM-based translation (Groq) for Indian languages."""

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import get_settings

SUPPORTED = frozenset({"hi", "mr", "te", "ta"})

LANG_NAMES = {
    "hi": "Hindi",
    "mr": "Marathi",
    "te": "Telugu",
    "ta": "Tamil",
}


async def translate_text(text: str, target_lang: str = "hi") -> str:
    """
    Translate text into the target language using Groq.

    Supports ISO-style short codes: hi, mr, te, ta (default Hindi).
    """
    settings = get_settings()
    code = target_lang.lower().strip()
    if code not in SUPPORTED:
        code = "hi"
    lang_name = LANG_NAMES[code]
    system = f"""You are a professional translator for Swaroop Formulation Industries Pvt. Ltd.
Translate the user's text into {lang_name} ({code}).

Preserve numbers, units, product names, and standard codes (e.g. ISO, ASTM) unless a well-known
{lang_name} equivalent is standard. Keep formatting (bullets, line breaks) where sensible.
Output only the translated text, no preamble."""
    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.1,
    )
    response = await llm.ainvoke(
        [SystemMessage(content=system), HumanMessage(content=text)]
    )
    out = response.content if isinstance(response.content, str) else str(response.content)
    return out.strip()
