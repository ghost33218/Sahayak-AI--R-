import { NextRequest, NextResponse } from "next/server";
import { runOnlineCompletion } from "@/lib/groq";
import { getPersona } from "@/lib/personas";

export async function POST(req: NextRequest) {
  try {
    const { personaId, message, history } = await req.json();

    if (!personaId || !message) {
      return NextResponse.json(
        { error: "personaId and message are required" },
        { status: 400 }
      );
    }

    const persona = getPersona(personaId);
    const reply = await runOnlineCompletion(
      persona.systemPrompt,
      history ?? [],
      message
    );

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[/api/chat] failed:", err);
    return NextResponse.json(
      { error: "Online completion failed. Falling back to on-device model." },
      { status: 500 }
    );
  }
}
