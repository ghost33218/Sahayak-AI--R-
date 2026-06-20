"use client";

import type {
  ChatCompletionMessageParam,
  InitProgressReport,
  MLCEngine,
} from "@mlc-ai/web-llm";

// NOTE: WebLLM's supported model list changes as new quantized builds ship.
// Check https://github.com/mlc-ai/web-llm/blob/main/src/config.ts for the
// current id before deploying — this is the smallest well-supported
// instruction-tuned model as of writing, matching the deck's "Gemma 2B" pitch.
export const MODEL_ID = "gemma-2b-it-q4f16_1-MLC";

export type ModelLoadStage =
  | "idle"
  | "checking-cache"
  | "downloading"
  | "ready"
  | "error";

export interface ModelLoadProgress {
  stage: ModelLoadStage;
  progress: number; // 0-1
  text: string;
}

let enginePromise: Promise<MLCEngine> | null = null;

/**
 * Lazily creates the WebLLM engine. The first call (with internet) downloads
 * and shards-caches the model via the Cache API / IndexedDB. Every call after
 * that — even fully offline — resolves from cache, which is the entire thesis
 * of the app: one online visit, then it just works.
 */
export async function loadEngine(
  onProgress?: (p: ModelLoadProgress) => void
): Promise<MLCEngine> {
  if (enginePromise) return enginePromise;

  if (typeof navigator !== "undefined" && !("gpu" in navigator)) {
    onProgress?.({
      stage: "error",
      progress: 0,
      text:
        "This browser doesn't support WebGPU. SahayakAI's offline mode needs " +
        "Chrome/Edge 113+ on Android or desktop.",
    });
    throw new Error("WebGPU not available");
  }

  enginePromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");

    onProgress?.({
      stage: "checking-cache",
      progress: 0,
      text: "Checking for cached model…",
    });

    const initProgressCallback = (report: InitProgressReport) => {
      onProgress?.({
        stage: "downloading",
        progress: report.progress,
        text: report.text,
      });
    };

    const engine = await webllm.CreateMLCEngine(MODEL_ID, {
      initProgressCallback,
    });

    onProgress?.({ stage: "ready", progress: 1, text: "Model ready." });
    return engine;
  })();

  return enginePromise;
}

export function isModelCached(): boolean {
  // WebLLM stores shards under the Cache Storage API. A lightweight proxy
  // check: has this browser ever completed a load in this session/profile.
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("sahayak:model-ready") === "1";
}

export function markModelCached() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("sahayak:model-ready", "1");
}

/**
 * Runs a single-turn chat completion fully on-device. Used in offline mode.
 */
export async function runOfflineCompletion(
  systemPrompt: string,
  history: ChatCompletionMessageParam[],
  userMessage: string
): Promise<string> {
  const engine = await loadEngine();
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];

  const reply = await engine.chat.completions.create({
    messages,
    temperature: 0.6,
    max_tokens: 512,
  });

  return reply.choices[0]?.message?.content ?? "";
}
