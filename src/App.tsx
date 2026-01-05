
import ApiSettings from "./components/ApiSettings"
import Chatbot from "./components/Chatbot"
import Header from "./components/Header"
import Toast from "./components/Toast"

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Toast />
      <div className="fixed top-0 left-0 w-full z-50 border-b border-slate-800 bg-slate-950 py-4">
        <div className="mx-auto max-w-[1024px] px-4">
          <Header />
        </div>
      </div>

      <main className="mx-auto max-w-[1024px] px-4 pt-28 pb-6 space-y-8">
        <ApiSettings />
        <Chatbot />
      </main>
    </div>
  )
}


export default App
