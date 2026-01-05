import { useEffect, useState } from "react"
import ChatMessages from "./ChatMessages"
import type { ChatMessage } from "../types/chat"
import { toastError, toastSuccess } from "./Toast"

interface Response {
    id: string
    role: "assistant" | "user"
    content: string
    session_id: string
    created_at: string
}

const PAGE_SIZE = 20

const Chatbot = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [userDraft, setUserDraft] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [hasMore, setHasMore] = useState<boolean>(true)
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false)
    const [oldestMessageId, setOldestMessageId] = useState<number | null>(null)

    const [isLoadingDeleting, setIsLoadingDeleting] = useState<boolean>(false)

    useEffect(() => {
        const sessionId = localStorage.getItem("session_id")

        if (!sessionId) {
            setMessages([
                {
                    id: "welcome",
                    role: "assistant",
                    content: "Olá! Sou seu assistente Python. Como posso ajudar?"
                }
            ])
            setHasMore(false)
            return
        }

        loadHistory()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadHistory = async () => {
        const sessionId = localStorage.getItem("session_id")
        if (!sessionId || isLoadingHistory || !hasMore) return

        const backendUrl = import.meta.env.VITE_BACKEND_URL

        try {
            setIsLoadingHistory(true)

            const params = new URLSearchParams({
                limit: String(PAGE_SIZE),
                ...(oldestMessageId !== null && { before_id: String(oldestMessageId) })
            })

            const response = await fetch(
                `${backendUrl}/api/history/${sessionId}?${params.toString()}`
            )

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data: Response[] = await response.json()

            if (data.length === 0) {
                setHasMore(false)
                return
            }

            const historyMessages: ChatMessage[] = data.map(msg => ({
                id: String(msg.id),
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content
            }))

            setMessages(prev =>
                oldestMessageId === null
                    ? historyMessages       
                    : [...historyMessages, ...prev] 
            )


            setOldestMessageId(Number(data[0].id))

            if (data.length < PAGE_SIZE) {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Erro ao carregar histórico:", error)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    const sendMessage = async () => {
        const apiKey = localStorage.getItem("api_key")
        if (!apiKey) {
            toastError("Por favor, insira sua chave de api antes de enviar uma mensagem!")
            return
        }

        const modelProvider = localStorage.getItem("model_provider")
        if (!modelProvider) {
            toastError("Por favor, selecione um provedor de modelo!")
            return
        }

        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const sessionId = localStorage.getItem("session_id")

        const payload = {
            question: userDraft,
            model_provider: modelProvider,
            ...(sessionId && { session_id: sessionId })
        }

        try {
            setIsLoading(true)

            const userMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "user",
                content: userDraft
            }

            setMessages(prev => [...prev, userMessage])
            setUserDraft("")

            const response = await fetch(`${backendUrl}/api/chatbot`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json()
                toastError(errorData.detail)
                return
            }

            const rawData = await response.json()

            const data: Response = {
                ...rawData,
                id: String(rawData.id)
            }

            if (!sessionId) {
                localStorage.setItem("session_id", data.session_id)
            }

            const assistantMessage: ChatMessage = {
                id: data.id,
                role: "assistant",
                content: data.content
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const deleteConversation = async () => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL
        const sessionId = localStorage.getItem("session_id")
        
        try {
            setIsLoadingDeleting(true)

            const response = await fetch(
                `${backendUrl}/api/history/${sessionId}`,
                {
                    method: 'delete'
                }
            )
    
            if (!response.ok) {
                const errorData = await response.json()
                toastError(errorData.detail)
                return
            }
    
            const data = await response.json()
            
            setMessages([])
            setHasMore(false)
            setOldestMessageId(null)
            localStorage.removeItem("session_id")
    
            toastSuccess(data)
        } finally {
            setIsLoadingDeleting(false)
        }
    }

    const hasSessionID = () => {
        const sessionId = localStorage.getItem("session_id")
        return !!sessionId 
    }

    return (
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-base font-semibold text-slate-100 mb-3">
                Chat
            </h2>

            {hasMore && (
                <div className="flex justify-center mb-3">
                    <button
                        onClick={loadHistory}
                        disabled={isLoadingHistory}
                        className="text-xs text-indigo-400 hover:underline disabled:opacity-50"
                    >
                        {isLoadingHistory ? "Carregando..." : "Ver mensagens anteriores"}
                    </button>
                </div>
            )}

            <ChatMessages messages={messages} />

            <textarea
                rows={4}
                value={userDraft}
                placeholder="Digite sua mensagem..."
                className="
                    w-full mt-4 p-3 mb-3
                    bg-slate-950
                    text-slate-100
                    border border-slate-700
                    rounded-md
                    resize-none
                    outline-none
                    focus:border-indigo-500
                    placeholder-slate-500
                "
                onChange={(e) => setUserDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        if (!isLoading && userDraft.trim()) {
                            sendMessage()
                        }
                    }
                }}
            />

            <div className="flex justify-end gap-2">
                <button
                    className={`
                        px-4 py-2
                        text-white
                        text-sm font-medium
                        rounded-md
                        transition
                        ${(isLoadingDeleting || !hasSessionID()) ? "bg-slate-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-500"}
                    `}
                    onClick={deleteConversation}
                    disabled={isLoadingDeleting || !hasSessionID()}    
                >
                    {isLoadingDeleting ? "Apagando..." : "Apagar conversa"}
                </button>
                <button
                    className={`
                        px-4 py-2
                        text-white
                        text-sm font-medium
                        rounded-md
                        transition
                        ${(isLoading || !userDraft.trim()) ? "bg-slate-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"}
                    `}
                    onClick={sendMessage}
                    disabled={isLoading || !userDraft.trim()}
                >
                    {isLoading ? "Enviando..." : "Enviar"}
                </button>
            </div>
        </section>
    )
}

export default Chatbot
