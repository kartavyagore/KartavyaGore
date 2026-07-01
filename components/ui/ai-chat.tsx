"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The public AI chat widget. Lives in the bottom-right chrome.
 *
 * Features:
 *   - Model selector (Gemini / MiniMax M3 / Auto). Persists in
 *     localStorage. The selected model picks which /api/ai/* route
 *     receives the question.
 *   - For authenticated admins, a small "Keys" disclosure lets them
 *     paste / replace / delete the Gemini and NVIDIA (MiniMax) keys.
 *     The status comes from /api/admin/{gemini,minimax}-key.
 *   - All UI is editorial: tiny sans labels, paper-card panel,
 *     Playfair serif for the assistant's reply.
 */
type Model = "auto" | "gemini" | "minimax";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  /** Which model produced this reply, when known. */
  model?: "gemini" | "minimax";
  /** The raw model id returned by the API (e.g. "gemini-2.5-flash",
   *  "minimaxai/minimax-m3"). */
  modelId?: string;
};

type KeyStatus = {
  configured: boolean;
  source: "database" | "environment" | "none";
  preview: string | null;
};

const MODEL_STORAGE_KEY = "kg-ai-model";

function readStoredModel(): Model {
  if (typeof window === "undefined") return "auto";
  const stored = window.localStorage.getItem(MODEL_STORAGE_KEY);
  if (stored === "gemini" || stored === "minimax" || stored === "auto") {
    return stored;
  }
  return "auto";
}

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [model, setModelState] = useState<Model>("auto");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Ask me about Kartavya's projects, stack, or what he's been building lately.",
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  // Auth + key management state.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<KeyStatus | null>(null);
  const [minimaxStatus, setMinimaxStatus] = useState<KeyStatus | null>(null);
  const [geminiInput, setGeminiInput] = useState("");
  const [minimaxInput, setMinimaxInput] = useState("");
  const [savingKey, setSavingKey] = useState<null | "gemini" | "minimax">(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Hydrate the model choice after mount to avoid SSR mismatch.
  useEffect(() => {
    setModelState(readStoredModel());
  }, []);

  // Focus the input when the panel opens, and keep the latest
  // message in view as new ones arrive.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  // Listen for the global event the rest of the site fires
  // (e.g. a future "Ask" link anywhere) to open the panel.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("kg:open-ai-chat", handler);
    return () => window.removeEventListener("kg:open-ai-chat", handler);
  }, []);

  // When the panel opens, check auth status. If authed, fetch
  // both keys' status so the admin can see what's configured.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      try {
        const authResponse = await fetch("/api/auth/verify", {
          credentials: "include",
        });
        if (cancelled) return;
        const loggedIn = authResponse.ok;
        setIsAuthenticated(loggedIn);
        setAuthChecked(true);
        if (!loggedIn) {
          setGeminiStatus(null);
          setMinimaxStatus(null);
          return;
        }
        const [g, m] = await Promise.all([
          fetch("/api/admin/gemini-key", { credentials: "include" }),
          fetch("/api/admin/minimax-key", { credentials: "include" }),
        ]);
        if (cancelled) return;
        if (g.ok) setGeminiStatus((await g.json()) as KeyStatus);
        if (m.ok) setMinimaxStatus((await m.json()) as KeyStatus);
      } catch {
        if (cancelled) return;
        setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const setModel = (next: Model) => {
    setModelState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODEL_STORAGE_KEY, next);
    }
  };

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setLoading(true);

    // Pick the route. Auto tries Gemini first, falls back to MiniMax
    // if Gemini reports a 503 (not configured).
    type Reply = {
      answer: string;
      model: "gemini" | "minimax";
      modelId?: string;
    };
    const attempt = async (which: "gemini" | "minimax"): Promise<Reply> => {
      const route = which === "gemini" ? "/api/ai/recruiter" : "/api/ai/minimax";
      const response = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        model?: string;
        result?: { answer?: string };
        error?: string;
      };
      if (response.status === 503 && which === "gemini" && model === "auto") {
        // Try the other model in auto mode.
        return attempt("minimax");
      }
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "AI request failed");
      }
      const answer =
        data.result?.answer?.trim() ||
        "I couldn't find a good answer to that. Try rephrasing the question.";
      return {
        answer,
        model: which,
        modelId: typeof data.model === "string" ? data.model : undefined,
      };
    };

    try {
      const which: "gemini" | "minimax" =
        model === "minimax" ? "minimax" : "gemini";
      const reply = await attempt(which);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: reply.answer,
          model: reply.model,
          modelId: reply.modelId,
        },
      ]);
    } catch (err) {
      setError((err as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const saveKey = async (which: "gemini" | "minimax") => {
    const value = which === "gemini" ? geminiInput : minimaxInput;
    if (!value.trim()) return;
    setSavingKey(which);
    try {
      const route =
        which === "gemini"
          ? "/api/admin/gemini-key"
          : "/api/admin/minimax-key";
      const response = await fetch(route, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ apiKey: value.trim() }),
      });
      const data = (await response.json()) as KeyStatus & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to save key");
      }
      if (which === "gemini") {
        setGeminiStatus(data);
        setGeminiInput("");
      } else {
        setMinimaxStatus(data);
        setMinimaxInput("");
      }
    } catch (err) {
      setError((err as Error).message || "Failed to save key");
    } finally {
      setSavingKey(null);
    }
  };

  const clearKey = async (which: "gemini" | "minimax") => {
    setSavingKey(which);
    try {
      const route =
        which === "gemini"
          ? "/api/admin/gemini-key"
          : "/api/admin/minimax-key";
      const response = await fetch(route, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Failed to clear key");
      }
      if (which === "gemini") {
        setGeminiStatus({ configured: false, source: "none", preview: null });
      } else {
        setMinimaxStatus({ configured: false, source: "none", preview: null });
      }
    } catch (err) {
      setError((err as Error).message || "Failed to clear key");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <>
      {/* Trigger — sits in the bottom-right chrome column, above
          the theme toggle. Visually hidden while the panel is open
          (the panel has its own × in the head), but kept in the
          layout so the chrome column doesn't shift. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          open
            ? "kg-toggle kg-ai-trigger kg-ai-trigger-hidden"
            : "kg-toggle kg-ai-trigger"
        }
        aria-label="Open AI chat"
        tabIndex={open ? -1 : 0}
      >
        Ask
      </button>

      {open ? (
        <div
          className="kg-ai-panel"
          role="dialog"
          aria-label="AI chat about Kartavya Gore"
        >
          <div className="kg-ai-panel-head">
            <span className="kg-eyebrow">Ask</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="kg-close"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Model selector. Three small chip-style buttons. The
              selected chip is filled; others are outline only. */}
          <div className="kg-ai-models" role="radiogroup" aria-label="Model">
            {(
              [
                { id: "auto", label: "Auto" },
                { id: "gemini", label: "Gemini" },
                { id: "minimax", label: "MiniMax M3" },
              ] as Array<{ id: Model; label: string }>
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={model === m.id}
                onClick={() => setModel(m.id)}
                className={
                  model === m.id
                    ? "kg-ai-model-chip kg-ai-model-chip-on"
                    : "kg-ai-model-chip"
                }
              >
                {m.label}
              </button>
            ))}
          </div>

          <div ref={listRef} className="kg-ai-panel-list">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="kg-ai-msg kg-ai-msg-user">
                  {m.content}
                </div>
              ) : (
                <div key={m.id} className="kg-ai-msg-block">
                  {m.model ? (
                    <span className="kg-ai-msg-model" title={m.modelId}>
                      {m.model === "gemini" ? "Gemini : " : "MiniMax M3 : "}
                      {/* {m.modelId ? ` · ${m.modelId}` : ""} */}
                    </span>
                  ) : null}
                  <div className="kg-ai-msg kg-ai-msg-bot">{m.content}
                  </div>
                </div>
              ),
            )}
            {loading ? (
              <div className="kg-ai-msg kg-ai-msg-bot kg-ai-msg-loading">
                Thinking…
              </div>
            ) : null}
          </div>

          <form
            className="kg-ai-panel-foot"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about a project, the stack, or fit…"
              className="kg-ai-input"
              disabled={loading}
            />
            <button
              type="submit"
              className="kg-toggle kg-ai-send"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>

          {/* Admin: API key management. Only visible after we've
              confirmed the user is authenticated. */}
          {authChecked && isAuthenticated ? (
            <div className="kg-ai-keys">
              <button
                type="button"
                onClick={() => setKeysOpen((v) => !v)}
                className="kg-toggle kg-ai-keys-toggle"
                aria-expanded={keysOpen}
              >
                {keysOpen ? "Hide keys" : "Manage keys"}
              </button>
              {keysOpen ? (
                <div className="kg-ai-keys-body">
                  <KeyRow
                    label="Gemini"
                    status={geminiStatus}
                    value={geminiInput}
                    onChange={setGeminiInput}
                    saving={savingKey === "gemini"}
                    onSave={() => void saveKey("gemini")}
                    onClear={() => void clearKey("gemini")}
                  />
                  <KeyRow
                    label="MiniMax M3"
                    status={minimaxStatus}
                    value={minimaxInput}
                    onChange={setMinimaxInput}
                    saving={savingKey === "minimax"}
                    onSave={() => void saveKey("minimax")}
                    onClear={() => void clearKey("minimax")}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="kg-ai-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function KeyRow({
  label,
  status,
  value,
  onChange,
  saving,
  onSave,
  onClear,
}: {
  label: string;
  status: KeyStatus | null;
  value: string;
  onChange: (next: string) => void;
  saving: boolean;
  onSave: () => void;
  onClear: () => void;
}) {
  return (
    <div className="kg-ai-key-row">
      <div className="kg-ai-key-row-head">
        <span className="kg-eyebrow">{label}</span>
        <span className="kg-ai-key-status">
          {status
            ? status.configured
              ? `${status.source === "database" ? "Saved" : "Env"} · ${status.preview ?? ""}`
              : "Not set"
            : "…"}
        </span>
      </div>
      <div className="kg-ai-key-row-input">
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste API key"
          className="kg-ai-input"
          disabled={saving}
        />
        <button
          type="button"
          onClick={onSave}
          className="kg-toggle kg-ai-send"
          disabled={saving || !value.trim()}
        >
          {saving ? "Saving" : "Save"}
        </button>
      </div>
      {status?.configured ? (
        <button
          type="button"
          onClick={onClear}
          className="kg-ai-key-clear"
          disabled={saving}
        >
          Clear stored key
        </button>
      ) : null}
    </div>
  );
}
