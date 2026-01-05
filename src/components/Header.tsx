import { Code } from "lucide-react"

const Header = () => {
    return (
        <header className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-indigo-500/10">
                <Code className="text-indigo-400" />
            </div>
            <div>
                <h1 className="text-lg font-semibold text-slate-100">
                    Python AI Chat
                </h1>
                <p className="text-sm text-slate-400">
                    Seu assistente Python
                </p>
            </div>
        </header>
    )
}

export default Header
