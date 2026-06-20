"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage, ConnectivityMode, PersonaId } from "@/types";
import { getPersona } from "@/lib/personas";
import { loadHistory, saveHistory } from "@/lib/db";
import {
  loadEngine,
  markModelCached,
  ModelLoadProgress,
  runOfflineCompletion,
} from "@/lib/webllm";
import MessageBubble from "./MessageBubble";
import VoiceInputButton from "./VoiceInputButton";

interface Props {
  personaId: PersonaId;
  mode: ConnectivityMode;
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatInterface({ personaId, mode }: Props) {
  const persona = getPersona(personaId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [modelProgress, setModelProgress] = useState<ModelLoadProgress | null>(
    null
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load this persona's saved history from IndexedDB when switching tabs.
  useEffect(() => {
    let cancelled = false;
    loadHistory(personaId).then((history) => {
      if (!cancelled) setMessages(history);
    });
    return () => {
      cancelled = true;
    };
  }, [personaId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  // Pre-warm the on-device engine on first online visit, so it's cached
  // before the user ever loses signal. Silent — only shows progress if the
  // user is actually waiting on a reply that needs it.
  useEffect(() => {
    if (mode === "online") {
      loadEngine().then(() => markModelCached()).catch(() => {
        /* WebGPU unsupported — offline mode will surface this on demand */
      });
    }
  }, [mode]);

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      persona: personaId,
      mode,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      let reply: string;

      if (mode === "online") {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personaId,
            message: trimmed,
            history: nextMessages.slice(-8).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });
        if (!res.ok) throw new Error("online completion failed");
        reply = (await res.json()).reply;
      } else {
        reply = await runOfflineCompletion(
          persona.systemPrompt,
          nextMessages.slice(-8).map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
          trimmed
        );
      }

      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: reply || "माफ़ कीजिए, जवाब नहीं बन पाया। फिर कोशिश करें।",
        persona: personaId,
        mode,
        timestamp: Date.now(),
      };

      const withReply = [...nextMessages, assistantMsg];
      setMessages(withReply);
      await saveHistory(personaId, withReply);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content:
          mode === "offline"
            ? "मॉडल लोड नहीं हो पाया। पहली बार इंटरनेट से जोड़कर मॉडल डाउनलोड करें।"
            : "ऑनलाइन सेवा में समस्या है। दोबारा कोशिश करें।",
        persona: personaId,
        mode,
        timestamp: Date.now(),
      };
      setMessages([...nextMessages, errorMsg]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <button
            onClick={() => handleSend(persona.examplePromptHi)}
            className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-left text-sm text-slate-soft transition-colors hover:border-marigold hover:text-indigo-night"
          >
            <span className="font-body">{persona.examplePromptHi}</span>
            <span className="mt-1 block font-mono text-[11px] text-slate-soft/70">
              {persona.examplePrompt}
            </span>
          </button>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-soft shadow-sm ring-1 ring-slate-200">
              {mode === "offline" ? "सोच रहा हूँ (on-device)…" : "सोच रहा हूँ…"}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 border-t border-slate-200 px-4 py-3"
      >
        <VoiceInputButton onResult={(text) => handleSend(text)} disabled={sending} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="अपना सवाल लिखें… "
          className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:border-marigold"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-full bg-indigo-night px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          भेजें
        </button>
      </form>
    </div>
  );
}
