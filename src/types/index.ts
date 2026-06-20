export type PersonaId = "farmer" | "asha" | "teacher";

export interface Persona {
  id: PersonaId;
  label: string; // English
  labelHi: string; // Hindi
  emoji: string;
  accentVar: string; // CSS var name resolved per-persona
  systemPrompt: string;
  examplePrompt: string;
  examplePromptHi: string;
}

export type ConnectivityMode = "offline" | "online";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  persona: PersonaId;
  mode: ConnectivityMode;
  timestamp: number;
}

export interface ConversationRecord {
  personaId: PersonaId;
  messages: ChatMessage[];
  updatedAt: number;
}
