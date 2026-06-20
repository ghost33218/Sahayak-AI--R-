"use client";

import { get, set, del, keys } from "idb-keyval";
import { ChatMessage, PersonaId } from "@/types";

function keyFor(personaId: PersonaId) {
  return `sahayak:history:${personaId}`;
}

export async function loadHistory(personaId: PersonaId): Promise<ChatMessage[]> {
  const stored = await get<ChatMessage[]>(keyFor(personaId));
  return stored ?? [];
}

export async function saveHistory(
  personaId: PersonaId,
  messages: ChatMessage[]
): Promise<void> {
  // Cap stored history so IndexedDB doesn't grow unbounded on a low-storage
  // device — keep the most recent 40 turns per persona.
  const trimmed = messages.slice(-40);
  await set(keyFor(personaId), trimmed);
}

export async function clearHistory(personaId: PersonaId): Promise<void> {
  await del(keyFor(personaId));
}

export async function clearAllHistory(): Promise<void> {
  const allKeys = await keys();
  await Promise.all(
    allKeys
      .filter((k) => typeof k === "string" && k.startsWith("sahayak:history:"))
      .map((k) => del(k))
  );
}
