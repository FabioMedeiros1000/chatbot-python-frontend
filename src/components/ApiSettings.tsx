import { useEffect, useState } from "react"
import { Settings, KeyIcon, Star, EyeOff, Eye } from "lucide-react"

const ApiSettings = () => {
    const [provider, setProvider] = useState<string>("")
    const [apikey, setApikey] = useState<string>("")
    const [showApikey, setShowApikey] = useState<boolean>(false)

    useEffect(() => {
        const storedProvider = localStorage.getItem("model_provider")
        const storedApiKey = localStorage.getItem("api_key")

        if (storedProvider) setProvider(storedProvider)
        if (storedApiKey) setApikey(storedApiKey)
    }, [])

    useEffect(() => {
        localStorage.setItem("model_provider", provider)
    }, [provider])

    useEffect(() => {
        localStorage.setItem("api_key", apikey)
    }, [apikey])

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
                        <KeyIcon size={16} />
                        API Key
                    </label>
                    <div className="relative">
                        <input
                            type={showApikey ? "text": "password"}
                            value={apikey}
                            placeholder="Sua chave de API"
                            className="
                                w-full p-2.5
                                bg-slate-950
                                text-slate-100
                                border border-slate-700
                                rounded-md
                                outline-none
                                focus:border-indigo-500
                                placeholder-slate-500
                            "
                            onChange={(e) => setApikey(e.target.value)}
                        />
                        <button 
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 bg-slate-950 p-1"
                            onClick={() => setShowApikey(!showApikey)}    
                        >
                            {showApikey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2 mb-2 text-slate-300 text-sm">
                        <Star size={16} />
                        Provedor
                    </label>
                    <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="
                            w-full p-2.5
                            bg-slate-950
                            text-slate-100
                            border border-slate-700
                            rounded-md
                            outline-none
                            focus:border-indigo-500
                        "
                    >
                        <option value="" disabled>
                            Selecione seu modelo
                        </option>
                        <option value="chatgpt" className="text-white">
                            ChatGPT
                        </option>
                        <option value="groq" className="text-white">
                            Groq
                        </option>
                    </select>
                </div>
            </div>
        </section>
    )
}

export default ApiSettings
