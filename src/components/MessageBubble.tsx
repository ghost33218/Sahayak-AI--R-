import { ChatMessage } from "@/types";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={["flex", isUser ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-indigo-night text-white"
            : "bg-white text-indigo-night shadow-sm ring-1 ring-slate-200",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap font-body">{message.content}</p>
        {!isUser && (
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-slate-soft">
            {message.mode === "offline" ? "on-device · gemma 2b" : "cloud · groq"}
          </p>
        )}
      </div>
    </div>
  );
}
