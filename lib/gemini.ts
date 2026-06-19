import { getApiKeyStatus, resolveApiKey, saveApiKey as saveApiKeyRaw, clearApiKey as clearApiKeyRaw, maskApiKey } from "./api-keys"

export { maskApiKey }

const SETTING_KEY = "gemini_api_key"
const ENV_VAR_NAME = "GEMINI_API_KEY"

export async function saveGeminiApiKey(apiKey: string): Promise<void> {
  await saveApiKeyRaw(SETTING_KEY, apiKey)
}

export async function getGeminiApiKey(): Promise<string | null> {
  const { value } = await resolveApiKey(SETTING_KEY, ENV_VAR_NAME)
  return value
}

export async function getGeminiKeyStatus() {
  return getApiKeyStatus(SETTING_KEY, ENV_VAR_NAME)
}

export async function clearGeminiApiKey(): Promise<void> {
  await clearApiKeyRaw(SETTING_KEY)
}

export type GeminiMode = "copilot" | "match" | "summary" | "search" | "intro"

export type GeminiAiRequest = {
  mode: GeminiMode
  query?: string
  blogSlug?: string
  blogText?: string
  tone?: string
}

export type GeminiAiResult = {
  answer: string
  summary?: string
  shortIntro?: string
  recruiterAngle?: string
  projectMatches?: Array<{ title: string; reason: string; relevance: string }>
  blogMatches?: Array<{ title: string; slug: string; reason: string; relevance: string }>
  keyTakeaways?: string[]
  sourceTitle?: string | null
}

function parseJsonResponse(text: string) {
  const trimmed = text.trim()
  const codeFenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  const payload = codeFenceMatch ? codeFenceMatch[1].trim() : trimmed
  return JSON.parse(payload) as GeminiAiResult
}

export async function callGeminiJson(prompt: string, systemInstruction: string): Promise<GeminiAiResult> {
  const apiKey = await getGeminiApiKey()
  if (!apiKey) {
    throw new Error("Gemini API key is not configured")
  }

  const model = (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim()
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
      }),
    },
  )

  const raw = (await response.json().catch(() => null)) as
    | {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>
          }
        }>
        error?: { message?: string }
      }
    | null

  if (!response.ok) {
    throw new Error(raw?.error?.message || `Gemini request failed with status ${response.status}`)
  }

  const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error("Gemini returned an empty response")
  }

  return parseJsonResponse(text)
}
