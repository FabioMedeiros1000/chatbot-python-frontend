export type Provider = "free" | "openai" | "groq" | "google"

export const PROVIDER_OPTIONS: { value: Provider; label: string }[] = [
    { value: "free", label: "Gratuito (sem chave)" },
    { value: "openai", label: "OpenAI (sua chave)" },
    { value: "groq", label: "Groq (sua chave)" },
    { value: "google", label: "Google Gemini (sua chave)" },
]

const SETTINGS_EVENT = "settings-changed"

const read = (key: string): string | null => {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

const write = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value)
    } catch {
        /* localStorage indisponível: segue sem persistir */
    }
}

// Migra configurações antigas: provedor "chatgpt" virou "openai" e a chave
// única "api_key" passou a ser guardada por provedor.
export const migrateLegacySettings = () => {
    const raw = read("model_provider")
    const legacyKey = read("api_key")

    if (raw === "chatgpt") write("model_provider", "openai")

    if (legacyKey) {
        const target = raw === "chatgpt" ? "openai" : raw
        if (target === "openai" || target === "groq" || target === "google") {
            if (!read(`api_key:${target}`)) write(`api_key:${target}`, legacyKey)
        }
        try {
            localStorage.removeItem("api_key")
        } catch {
            /* ignora */
        }
    }
}

export const getProvider = (): Provider => {
    const raw = read("model_provider")
    return raw === "openai" || raw === "groq" || raw === "google" ? raw : "free"
}

export const getApiKey = (provider: Provider): string =>
    provider === "free" ? "" : read(`api_key:${provider}`) ?? ""

export const getModel = (): string => read("model") ?? ""

export const saveSettings = (settings: {
    provider?: Provider
    apiKey?: { provider: Provider; value: string }
    model?: string
}) => {
    if (settings.provider !== undefined) write("model_provider", settings.provider)
    if (settings.apiKey) write(`api_key:${settings.apiKey.provider}`, settings.apiKey.value)
    if (settings.model !== undefined) write("model", settings.model)
    window.dispatchEvent(new Event(SETTINGS_EVENT))
}

export const onSettingsChanged = (callback: () => void) => {
    window.addEventListener(SETTINGS_EVENT, callback)
    return () => window.removeEventListener(SETTINGS_EVENT, callback)
}

// Mensagem de erro do backend: `detail` é string, exceto em erros 422 (lista).
export const errorMessage = (data: unknown, fallback: string): string => {
    const detail = (data as { detail?: unknown } | null)?.detail
    return typeof detail === "string" ? detail : fallback
}
