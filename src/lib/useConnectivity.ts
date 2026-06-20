"use client";

import { useEffect, useState } from "react";
import { ConnectivityMode } from "@/types";

/**
 * Wraps navigator.onLine plus the online/offline window events. We also
 * double-check with a tiny HEAD request on reconnect, since navigator.onLine
 * only reflects link state (e.g. "connected to Wi-Fi"), not real internet
 * reachability — a captive portal would otherwise report a false positive.
 */
export function useConnectivity(): ConnectivityMode {
  const [mode, setMode] = useState<ConnectivityMode>("offline");

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    let cancelled = false;

    async function verify() {
      if (!navigator.onLine) {
        if (!cancelled) setMode("offline");
        return;
      }
      try {
        await fetch("/api/ping", { method: "HEAD", cache: "no-store" });
        if (!cancelled) setMode("online");
      } catch {
        if (!cancelled) setMode("offline");
      }
    }

    verify();
    window.addEventListener("online", verify);
    window.addEventListener("offline", verify);

    return () => {
      cancelled = true;
      window.removeEventListener("online", verify);
      window.removeEventListener("offline", verify);
    };
  }, []);

  return mode;
}
