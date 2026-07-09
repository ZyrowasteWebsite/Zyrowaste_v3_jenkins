interface ChatResponse {
  reply: string;
  sources?: any[];
}

export default async function chatAPI(messages: { role: string; content: string }[]): Promise<ChatResponse> {
  try {
    //const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
    const API_URL = import.meta.env.VITE_API_URL || "";

    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Chat API error:", errText);
      return { reply: "Error: Chat API failed" };
    }

    const data: ChatResponse = await response.json();
    return data;

  } catch (err) {
    console.error("Chat API fetch error:", err);
    return { reply: "Error: Unable to reach Chat API" };
  }
}