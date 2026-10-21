import {
  AGARLY_PROVIDER_JSON_SCHEMA,
  normalizeAgarlyFilters,
  type AgarlyFilters,
} from "@/lib/agarly/schema"
import { agarlySystemPrompt } from "@/lib/agarly/prompt"

export type AgarlyProviderName = "kilo" | "openai"

export type AgarlyProvider = {
  name: AgarlyProviderName
  model: string
  extractFilters(prompt: string, signal: AbortSignal): Promise<AgarlyFilters>
}

export class AgarlyProviderError extends Error {
  constructor(
    public readonly code:
      | "NOT_CONFIGURED"
      | "TIMEOUT"
      | "RATE_LIMITED"
      | "BAD_RESPONSE"
      | "UNAVAILABLE",
    message: string,
  ) {
    super(message)
    this.name = "AgarlyProviderError"
  }
}

function jsonFromContent(content: string): unknown {
  const trimmed = content.trim()
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
  try {
    return JSON.parse(withoutFence)
  } catch {
    throw new AgarlyProviderError("BAD_RESPONSE", "Provider returned invalid JSON")
  }
}

async function fetchProviderJson(input: {
  url: string
  apiKey: string
  body: unknown
  signal: AbortSignal
}): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(input.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input.body),
      signal: input.signal,
      cache: "no-store",
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AgarlyProviderError("TIMEOUT", "Provider request timed out")
    }
    throw new AgarlyProviderError("UNAVAILABLE", "Provider request failed")
  }

  if (response.status === 429) {
    throw new AgarlyProviderError("RATE_LIMITED", "Provider rate limit reached")
  }
  if (!response.ok) {
    throw new AgarlyProviderError(
      response.status >= 500 ? "UNAVAILABLE" : "BAD_RESPONSE",
      `Provider returned HTTP ${response.status}`,
    )
  }
  try {
    return await response.json()
  } catch {
    throw new AgarlyProviderError("BAD_RESPONSE", "Provider returned a non-JSON response")
  }
}

function chatContent(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    throw new AgarlyProviderError("BAD_RESPONSE", "Provider response is empty")
  }
  const choices = (payload as { choices?: unknown }).choices
  if (!Array.isArray(choices)) {
    throw new AgarlyProviderError("BAD_RESPONSE", "Provider choices are missing")
  }
  const content = (choices[0] as { message?: { content?: unknown } } | undefined)?.message?.content
  if (typeof content !== "string" || !content.trim()) {
    throw new AgarlyProviderError("BAD_RESPONSE", "Provider content is missing")
  }
  return content
}

export function createKiloProvider(apiKey: string, model = "kilo-auto/free"): AgarlyProvider {
  return {
    name: "kilo",
    model,
    async extractFilters(prompt, signal) {
      const payload = await fetchProviderJson({
        url: "https://ai-gateway.kilo.ai/api/v1/chat/completions",
        apiKey,
        signal,
        body: {
          model,
          temperature: 0,
          max_tokens: 800,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: agarlySystemPrompt() },
            { role: "user", content: prompt },
          ],
        },
      })
      return normalizeAgarlyFilters(jsonFromContent(chatContent(payload)))
    },
  }
}

export function createOpenAiProvider(apiKey: string, model = "gpt-5-mini"): AgarlyProvider {
  return {
    name: "openai",
    model,
    async extractFilters(prompt, signal) {
      const payload = await fetchProviderJson({
        url: "https://api.openai.com/v1/chat/completions",
        apiKey,
        signal,
        body: {
          model,
          messages: [
            { role: "system", content: agarlySystemPrompt() },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "agarly_search_filters",
              strict: true,
              schema: AGARLY_PROVIDER_JSON_SCHEMA,
            },
          },
        },
      })
      return normalizeAgarlyFilters(jsonFromContent(chatContent(payload)))
    },
  }
}

export function getConfiguredAgarlyProvider(): AgarlyProvider {
  const selected = process.env.AI_PROVIDER?.trim().toLowerCase() || "kilo"
  if (selected === "openai") {
    const key = process.env.OPENAI_API_KEY?.trim()
    if (!key) throw new AgarlyProviderError("NOT_CONFIGURED", "OPENAI_API_KEY is missing")
    return createOpenAiProvider(key, process.env.OPENAI_MODEL?.trim() || undefined)
  }
  if (selected !== "kilo") {
    throw new AgarlyProviderError("NOT_CONFIGURED", "AI_PROVIDER is unsupported")
  }
  const key = process.env.KILO_API_KEY?.trim()
  if (!key) throw new AgarlyProviderError("NOT_CONFIGURED", "KILO_API_KEY is missing")
  return createKiloProvider(key, process.env.KILO_MODEL?.trim() || undefined)
}
