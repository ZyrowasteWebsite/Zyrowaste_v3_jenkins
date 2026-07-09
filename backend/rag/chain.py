"""LangChain RAG pipeline: Groq LLM + Chroma retrieval."""

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from config import get_settings

from rag.vectorstore import similarity_search

RAG_SYSTEM_PROMPT = """You are the AI assistant for Swaroop Formulation Industries Pvt. Ltd., a biodegradable plastic bag manufacturing company based in Unnao, Uttar Pradesh, India.

You MUST ground answers in the RETRIEVED CONTEXT below when it is relevant. If the context does not contain the answer, combine your general knowledge with the company facts below only where appropriate, and say clearly when information is not in the documents.

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

Respond concisely, professionally, and helpfully. Prefer facts supported by RETRIEVED CONTEXT for document-specific questions. If asked about topics outside the company scope, politely redirect. Use bullet points for lists. Mention specific numbers when relevant.

--- RETRIEVED CONTEXT ---
{context}
--- END CONTEXT ---
"""


def _dict_to_message(msg: dict[str, str]) -> BaseMessage | None:
    role = msg.get("role", "").lower()
    content = msg.get("content", "")
    if role == "system":
        return SystemMessage(content=content)
    if role == "user":
        return HumanMessage(content=content)
    if role == "assistant":
        return AIMessage(content=content)
    return None


def _last_user_query(messages: list[dict[str, str]]) -> str:
    for msg in reversed(messages):
        if msg.get("role", "").lower() == "user":
            return str(msg.get("content", "")).strip()
    return ""


def _conversation_without_client_system(
    messages: list[dict[str, str]],
) -> list[BaseMessage]:
    out: list[BaseMessage] = []
    for msg in messages:
        if msg.get("role", "").lower() == "system":
            continue
        m = _dict_to_message(msg)
        if m is not None:
            out.append(m)
    return out


async def get_rag_response(messages: list[dict[str, str]]) -> dict:
    """
    Retrieve relevant chunks, augment the system prompt, and call ChatGroq.

    Returns:
        {"reply": str, "sources": list[dict]} with source content and metadata.
    """
    settings = get_settings()
    query = _last_user_query(messages)
    docs = similarity_search(query, k=4) if query else []
    context = "\n\n---\n\n".join(d.page_content for d in docs) if docs else "(no matching passages retrieved)"
    system_content = RAG_SYSTEM_PROMPT.format(context=context)

    llm_messages: list[BaseMessage] = [SystemMessage(content=system_content)]
    llm_messages.extend(_conversation_without_client_system(messages))

    if len(llm_messages) == 1:
        llm_messages.append(
            HumanMessage(
                content=query
                or "Give a short, helpful overview of Swaroop Formulation Industries for a new visitor."
            )
        )

    llm = ChatGroq(
        groq_api_key=settings.groq_api_key,
        model_name=settings.llm_model,
        temperature=0.2,
    )
    response = await llm.ainvoke(llm_messages)
    reply_text = response.content if isinstance(response.content, str) else str(response.content)

    sources: list[dict] = [
        {"content": d.page_content, "metadata": dict(d.metadata or {})}
        for d in docs
    ]
    return {"reply": reply_text, "sources": sources}
