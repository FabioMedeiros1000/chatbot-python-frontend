import { Toaster, toast } from "react-hot-toast"

export const toastError = (message: string) => {
    toast.custom((t) => (
        <div
            className={`
        ${t.visible ? "animate-enter" : "animate-leave"}
        bg-red-600 text-white px-4 py-2 rounded-lg shadow-md border border-red-700
      `}
        >
            {message}
        </div>
    ))
}

export const toastSuccess = (message: string) => {
    toast.custom((t) => (
        <div
            className={`
                ${t.visible ? "animate-enter" : "animate-leave"}
                bg-green-600 text-white px-4 py-2 rounded-lg shadow-md border border-green-700
            `}
        >
            {message}
        </div>
    ))
}

const Toast = () => {
    return <Toaster position="top-right" />
}

export default Toast
