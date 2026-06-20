"use client";

import { PERSONAS } from "@/lib/personas";
import { PersonaId } from "@/types";

interface Props {
  active: PersonaId;
  onSelect: (id: PersonaId) => void;
}

export default function PersonaDock({ active, onSelect }: Props) {
  return (
    <nav
      aria-label="Choose who you are"
      className="flex flex-row gap-2 overflow-x-auto px-4 py-3 md:flex-col md:gap-3 md:overflow-visible md:px-3 md:py-6"
    >
      {PERSONAS.map((persona) => {
        const isActive = persona.id === active;
        return (
          <button
            key={persona.id}
            onClick={() => onSelect(persona.id)}
            aria-pressed={isActive}
            className={[
              "flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
              "md:w-full",
              isActive
                ? "border-transparent text-white shadow-sm"
                : "border-slate-200 text-indigo-night hover:border-slate-300",
            ].join(" ")}
            style={isActive ? { backgroundColor: `var(${persona.accentVar})` } : undefined}
          >
            <span className="text-xl" aria-hidden="true">
              {persona.emoji}
            </span>
            <span className="flex flex-col">
              <span className="font-body text-sm font-semibold leading-tight">
                {persona.labelHi}
              </span>
              <span
                className={[
                  "font-mono text-[11px] leading-tight",
                  isActive ? "text-white/80" : "text-slate-soft",
                ].join(" ")}
              >
                {persona.label}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
