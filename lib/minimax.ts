/**
 * MiniMax-M3 backend via NVIDIA's integrate API.
 * Non-streaming OpenAI-compatible chat-completions call.
 */

const DEFAULT_MODEL = "minimaxai/minimax-m3"
const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
const DEFAULT_MAX_TOKENS = 8192
const DEFAULT_TEMPERATURE = 1
const DEFAULT_TOP_P = 0.95

type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

type MiniMaxOptions = {
  systemInstruction?: string
  prompt: string
  model?: string
  maxTokens?: number
  temperature?: number
  topP?: number
}

export function getMiniMaxConfig() {
  const apiKey = process.env.NVIDIA_API_KEY?.trim() || ""
  const model = (process.env.MINIMAX_MODEL || DEFAULT_MODEL).trim()
  const baseUrl = (process.env.NVIDIA_INTEGRATION_URL || DEFAULT_BASE_URL).trim()
  return { apiKey, model, baseUrl, configured: Boolean(apiKey) }
}

export type MiniMaxCompletion = {
  content: string
  model: string
  raw?: unknown
}

export async function callMiniMax(options: MiniMaxOptions): Promise<MiniMaxCompletion> {
  const { apiKey, model, baseUrl } = getMiniMaxConfig()
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is not configured")
  }

  const messages: ChatMessage[] = []
  if (options.systemInstruction) {
    messages.push({ role: "system", content: options.systemInstruction })
  }
  messages.push({ role: "user", content: options.prompt })

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: options.model || model,
      messages,
      max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      top_p: options.topP ?? DEFAULT_TOP_P,
      stream: false,
    }),
  })

  const raw = (await response.json().catch(() => null)) as
    | {
        choices?: Array<{
          message?: { content?: string | null }
        }>
        error?: { message?: string }
      }
    | null

  if (!response.ok) {
    throw new Error(
      raw?.error?.message || `MiniMax request failed with status ${response.status}`,
    )
  }

  const content = raw?.choices?.[0]?.message?.content
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("MiniMax returned an empty response")
  }

  return {
    content: content.trim(),
    model: options.model || model,
    raw,
  }
}
