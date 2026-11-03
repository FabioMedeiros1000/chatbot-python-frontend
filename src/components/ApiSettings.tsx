import { useEffect, useState } from "react"
import { Settings, KeyIcon, Star, EyeOff, Eye, Cpu } from "lucide-react"
import {
    PROVIDER_OPTIONS,
    getApiKey,
    getModel,
    getProvider,
    migrateLegacySettings,
    saveSettings,
    type Provider,
} from "../lib/settings"

interface ModelInfo {
    id: string
    name: string
    free: boolean
}

interface ModelsResponse {
    models: ModelInfo[]
    requires_key: boolean
}

type ModelsStatus = "idle" | "loading" | "error"

const FREE_MODEL_LABEL = "Groq · gpt-oss-20b"

const inputClass = `
    w-full p-2.5
    bg-slate-950
    text-slate-100
    border border-slate-700
    rounded-md
    outline-none
    focus:border-indigo-500
    placeholder-slate-500
`

migrateLegacySettings()

const ApiSettings = () => {
    const [provider, setProvider] = useState<Provider>(getProvider)
    const [apikey, setApikey] = useState<string>(() => getApiKey(getProvider()))
    const [model, setModel] = useState<string>(getModel)
    const [showApikey, setShowApikey] = useState<boolean>(false)

    const [models, setModels] = useState<ModelInfo[]>([])
    const [status, setStatus] = useState<ModelsStatus>("idle")
    const [statusMessage, setStatusMessage] = useState<string>("")

    const isFree = provider === "free"
    const canList = !isFree && apikey.trim() !== ""

    // Sem chave não há o que listar: ignora o que sobrou de uma consulta anterior
    const visibleModels = canList ? models : []
    const visibleStatus: ModelsStatus = canList ? status : "idle"

    // Carrega os modelos do provedor quando há chave (com debounce na digitação)
    useEffect(() => {
        if (!canList) return

        const controller = new AbortController()
        const timer = setTimeout(async () => {
            setStatus("loading")
            setStatusMessage("")

            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL
                const response = await fetch(`${backendUrl}/api/models/${provider}`, {
                    headers: { Authorization: `Bearer ${apikey.trim()}` },
                    signal: controller.signal,
                })

                if (!response.ok) {
                    const data = await response.json().catch(() => null)
                    const detail = typeof data?.detail === "string" ? data.detail : "Não foi possível listar os modelos."
                    setModels([])
                    setStatus("error")
                    setStatusMessage(detail)
                    return
                }

                const data: ModelsResponse = await response.json()
                setModels(data.models)
                setStatus("idle")

                // mantém o modelo salvo se ainda existir; senão limpa a escolha
                const saved = getModel()
                const next = data.models.some(m => m.id === saved) ? saved : ""
                if (next !== saved) saveSettings({ model: next })
                setModel(next)
            } catch (error) {
                if ((error as Error).name === "AbortError") return
                setModels([])
                setStatus("error")
                setStatusMessage("Falha de rede ao listar os modelos.")
            }
        }, 600)

        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [provider, apikey, canList])

    const handleProviderChange = (next: Provider) => {
        const nextKey = getApiKey(next)
        setProvider(next)
        setApikey(nextKey)
        setModel("")
        setModels([])
        saveSettings({ provider: next, model: "" })
    }

    const handleApiKeyChange = (value: string) => {
        setApikey(value)
        saveSettings({ apiKey: { provider, value } })
    }

    const handleModelChange = (value: string) => {
        setModel(value)
        saveSettings({ model: value })
    }

    return (
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-5">
                <Settings className="text-indigo-400" />
                <h2 className="text-base font-semibold text-slate-100">
                    Configurações
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="flex items-center gap-2 mb-2 text-slate-300 text-sm">
                        <Star size={16} />
                        Provedor
                    </label>
                    <select
                        value={provider}
                        onChange={(e) => handleProviderChange(e.target.value as Provider)}
                        className={inputClass}
                    >
                        {PROVIDER_OPTIONS.map(option => (
                            <option key={option.value} value={option.value} className="text-white">
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {isFree ? (
                    <div>
                        <label className="flex items-center gap-2 mb-2 text-slate-300 text-sm">
                            <Cpu size={16} />
                            Modelo
                        </label>
                        <p className="p-2.5 text-sm text-slate-300 border border-slate-800 rounded-md bg-slate-950">
                            {FREE_MODEL_LABEL}
                            <span className="block text-xs text-slate-500 mt-1">
                                Sem chave de API, com limite diário de mensagens. Para mais, use sua própria chave.
                            </span>
                        </p>
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="flex items-center gap-2 mb-2 text-slate-300 text-sm">
                                <KeyIcon size={16} />
                                API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showApikey ? "text" : "password"}
                                    value={apikey}
                                    placeholder="Sua chave de API"
                                    className={inputClass}
                                    onChange={(e) => handleApiKeyChange(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 bg-slate-950 p-1"
                                    onClick={() => setShowApikey(!showApikey)}
                                >
                                    {showApikey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 mb-2 text-slate-300 text-sm">
                                <Cpu size={16} />
                                Modelo
                            </label>
                            <select
                                value={model}
                                onChange={(e) => handleModelChange(e.target.value)}
                                disabled={visibleModels.length === 0}
                                className={`${inputClass} disabled:opacity-60`}
                            >
                                <option value="" disabled>
                                    {!canList
                                        ? "Informe a chave para listar os modelos"
                                        : visibleStatus === "loading"
                                            ? "Carregando modelos..."
                                            : "Selecione o modelo"}
                                </option>
                                {visibleModels.map(m => (
                                    <option key={m.id} value={m.id} className="text-white">
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                            {visibleStatus === "error" && (
                                <p className="mt-1 text-xs text-red-400">{statusMessage}</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}

export default ApiSettings
