"""GenAI email drafting for stakeholder-specific tone (Groq)."""

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import get_settings

RECIPIENT_GUIDE: dict[str, str] = {
    "investor": (
        "Tone: formal, metrics-forward, transparent on risks and milestones. "
        "Focus on growth, capital efficiency, and compliance posture."
    ),
    "regulator": (
        "Tone: precise, deferential, fully factual. Reference standards and filings where relevant. "
        "No marketing language; emphasize traceability and compliance."
    ),
    "supplier": (
        "Tone: collaborative and operational. Clear on volumes, specs, timelines, and quality expectations."
    ),
    "customer": (
        "Tone: helpful and brand-appropriate. Emphasize sustainability benefits, certifications, and support."
    ),
}


async def draft_email(recipient_type: str, context: dict) -> str:
    """
    Draft an email body (plain text or light Markdown) tailored to recipient_type.

    recipient_type: one of investor | regulator | supplier | customer.
    context: free-form key/value facts to personalize (e.g. subject themes, dates, order IDs).
    """
    settings = get_settings()
    guide = RECIPIENT_GUIDE.get(
        recipient_type.lower(),
        "Tone: professional and neutral. Adapt to the facts in context.",
    )
    system = f"""You draft outbound email bodies for Swaroop Formulation Industries Pvt. Ltd.
(Biodegradable PLA packaging, Unnao, UP, India).

{guide}

Output only the email: optional Subject line on first line as 'Subject: ...', then a blank line, then the body.
Do not fabricate specific numbers or legal claims not present in context."""
    ctx_lines = "\n".join(f"- {k}: {v}" for k, v in context.items())
    user = f"Recipient type: {recipient_type}\n\nContext:\n{ctx_lines}\n\nWrite the email."
    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.35,
    )
    response = await llm.ainvoke(
        [SystemMessage(content=system), HumanMessage(content=user)]
    )
    text = response.content if isinstance(response.content, str) else str(response.content)
    return text.strip()
