"use client";

import { useState } from "react";
import { PersonaId } from "@/types";
import { PERSONAS, getPersona } from "@/lib/personas";
import { useConnectivity } from "@/lib/useConnectivity";
import PersonaDock from "@/components/PersonaDock";
import ConnectivityDial from "@/components/ConnectivityDial";
import ChatInterface from "@/components/ChatInterface";

export default function HomePage() {
  const [personaId, setPersonaId] = useState<PersonaId>(PERSONAS[0].id);
  const mode = useConnectivity();
  const persona = getPersona(personaId);

  return (
    <main className="flex min-h-screen flex-col bg-white md:flex-row">
      <header
        className="flex flex-col gap-4 bg-indigo-night px-4 py-4 text-white md:w-64 md:px-4 md:py-6"
      >
        <div>
          <p className="font-display text-xl font-semibold leading-none">
            SahayakAI
          </p>
          <p className="mt-1 font-body text-sm text-white/70">सहायक</p>
        </div>

        <ConnectivityDial mode={mode} />

        <div className="hidden md:block">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-white/50">
            Choose persona
          </p>
        </div>

        <PersonaDock active={personaId} onSelect={setPersonaId} />
      </header>

      <section className="flex flex-1 flex-col">
        <div
          className="flex items-center justify-between border-b border-slate-200 px-4 py-3"
          style={{ borderTopColor: `var(${persona.accentVar})` }}
        >
          <div>
            <p className="font-display text-lg font-semibold text-indigo-night">
              {persona.labelHi}
              <span className="ml-2 font-body text-sm font-normal text-slate-soft">
                {persona.label}
              </span>
            </p>
          </div>
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: `var(${persona.accentVar})` }}
            aria-hidden="true"
          />
        </div>

        <div className="min-h-0 flex-1">
          <ChatInterface personaId={personaId} mode={mode} />
        </div>
      </section>
    </main>
  );
}
