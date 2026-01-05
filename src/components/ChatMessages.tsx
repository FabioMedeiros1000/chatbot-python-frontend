import { User, Bot, ChevronDown } from "lucide-react"
import React, { useRef, useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

import type { ChatMessage } from "../types/chat"

interface ChatMessagesProps {
    messages: ChatMessage[]
}

const ChatMessages = ({ messages }: ChatMessagesProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isAtBottom, setIsAtBottom] = useState(true)

    // Checa a posição da rolagem
    const handleScroll = () => {
        if (!containerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current
        const atBottom = scrollHeight - scrollTop - clientHeight < 10
        setIsAtBottom(atBottom)
    }

    // Rola até o final
    const scrollToBottom = () => {
        containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: "smooth" })
    }

    useEffect(() => {
        if (isAtBottom) scrollToBottom()
    }, [messages])

    return (
        <div className="relative">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-2"
            >
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>

            {/* Botão "scroll to bottom" */}
            {!isAtBottom && (
                <button
                    onClick={scrollToBottom}
                    className="
                        absolute
                        bottom-0
                        left-1/2
                        -translate-x-1/2
                        bg-indigo-600
                        text-white
                        p-2
                        rounded-full
                        shadow-lg
                        hover:bg-indigo-500
                        transition
                        z-50
                    "
                >
                    <ChevronDown size={20} />
                </button>
            )}
        </div>
    )
}

interface MessageBubbleProps {
    message: ChatMessage
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
    const isUser = message.role === "user"

    return (
        <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && <Avatar icon={<Bot size={16} />} bg="bg-indigo-500/10" color="text-indigo-400" />}
            <div
                className={`
                    max-w-[80%]
                    px-4 py-3
                    text-sm
                    leading-relaxed
                    rounded-lg
                    whitespace-pre-wrap
                    ${isUser
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : "bg-slate-800 text-slate-100 rounded-bl-sm"
                    }
                `}
            >
                <ReactMarkdown
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                        code({ className, children, ...props }) {
                            const isBlock = className?.startsWith("language-")
                            return (
                                <code
                                    className={`
                                        ${isBlock ? "block" : ""}
                                        ${className ?? ""}
                                        bg-slate-900
                                        text-slate-100
                                        rounded-md
                                        px-2 py-1
                                        text-xs
                                        overflow-x-auto
                                    `}
                                    {...props}
                                >
                                    {children}
                                </code>
                            )
                        },
                    }}
                >
                    {message.content}
                </ReactMarkdown>
            </div>
            {isUser && <Avatar icon={<User size={16} />} bg="bg-slate-700" color="text-slate-200" />}
        </div>
    )
}

interface AvatarProps {
    icon: React.ReactNode
    bg: string
    color: string
}

const Avatar = ({ icon, bg, color }: AvatarProps) => {
    return (
        <div className={`h-8 w-8 flex items-center justify-center rounded-full ${bg} ${color} shrink-0`}>
            {icon}
        </div>
    )
}

export default ChatMessages
