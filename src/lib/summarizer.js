import axios from "axios";

export async function summarizeWithOpenAI(content, style) {
  const promptMap = {
    bullets: "Summarize this in 3 bullet points:",
    paragraph: "Summarize this as a concise paragraph:",
    simple: "Summarize this so a 5-year-old could understand it:",
    tldr: "TL;DR:",
    market: "What is the potential market impact of this news?",
    opinion: "What is your opinion about this news?"
  };

  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: `${promptMap[style]}\n\n${content}` }],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI error:", error.response?.data || error.message);
    return "⚠️ Summary unavailable.";
  }
}
