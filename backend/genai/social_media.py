"""LinkedIn-style sustainability posts via Groq (length-capped)."""

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import get_settings

LINKEDIN_MAX = 1300

SYSTEM = """You write LinkedIn posts for Swaroop Formulation Industries Pvt. Ltd.
(biodegradable PLA bags and packaging, Unnao, Uttar Pradesh, India).

Requirements:
- Professional, authentic voice; highlight sustainability and milestones.
- Include a short call to action (e.g. follow, visit site, partner, learn more).
- End with 3-6 relevant hashtags on the last line (mix of industry and brand-appropriate tags).
- Stay under 1300 characters total including hashtags and whitespace.
- Do not invent certifications or numbers not supplied in the brief.

Output only the post text (no JSON)."""


async def generate_linkedin_post(topic: str, data_points: list[str]) -> str:
    """Generate a LinkedIn post about a sustainability milestone; caps length at 1300 characters."""
    settings = get_settings()
    bullets = "\n".join(f"- {p}" for p in data_points) if data_points else "- (no extra data points)"
    user = f"Topic / milestone:\n{topic}\n\nData points to reflect (use only these facts):\n{bullets}"
    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.4,
    )
    response = await llm.ainvoke(
        [SystemMessage(content=SYSTEM), HumanMessage(content=user)]
    )
    text = response.content if isinstance(response.content, str) else str(response.content)
    text = text.strip()
    if len(text) > LINKEDIN_MAX:
        text = text[: LINKEDIN_MAX - 1].rstrip() + "…"
    return text
