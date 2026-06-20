// This file runs server-side only (called from the /api/chat route), so the
// Groq API key never reaches the browser bundle.
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Llama 3.1 8B on Groq's free tier — fast enough for sub-second replies,
// which is the point of "silently upgrading" once a connection appears.
const ONLINE_MODEL = "llama-3.1-8b-instant";

export async function runOnlineCompletion(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: ONLINE_MODEL,
    temperature: 0.6,
    max_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ],
  });

  return completion.choices[0]?.message?.content ?? "";
}
