"use client";

import { ConnectivityMode } from "@/types";

interface Props {
  mode: ConnectivityMode;
}

export default function ConnectivityDial({ mode }: Props) {
  const isOnline = mode === "online";

  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <div
        role="status"
        aria-label={isOnline ? "Online — cloud upgrade active" : "Offline — running on-device"}
        className={[
          "relative grid h-9 w-9 place-items-center rounded-full border-2 transition-colors",
          isOnline ? "border-marigold" : "border-white/40",
        ].join(" ")}
      >
        {/* Knob notch — rotates to point at the active state, like a transistor radio dial. */}
        <div
          className={[
            "absolute h-3 w-0.5 rounded-full bg-current transition-transform duration-300",
            isOnline ? "rotate-45" : "-rotate-45",
          ].join(" ")}
          style={{ top: "3px", transformOrigin: "50% 14px" }}
        />
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            isOnline ? "bg-marigold" : "bg-white/60",
          ].join(" ")}
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-white">{isOnline ? "ऑनलाइन" : "ऑफ़लाइन"}</span>
        <span className="text-white/50">
          {isOnline ? "Groq cloud" : "On-device"}
        </span>
      </div>
    </div>
  );
}
