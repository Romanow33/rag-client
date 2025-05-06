import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

interface Props {
    backend: string
}

type Message = { q: string; a: string | null }

export default function ChatBox({ backend }: Props) {
    const [question, setQuestion] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const sendQuestion = async () => {
        if (!question.trim()) return
        const newMessage = { q: question, a: null }
        setMessages((prev) => [...prev, newMessage])
        setQuestion('')
        setLoading(true)

        try {
            const res = await axios.post(`${backend}/ask`, { question })
            setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...updated[updated.length - 1], a: res.data.answer }
                return updated
            })
        } catch {
            setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...updated[updated.length - 1], a: '❌ Error en la consulta' }
                return updated
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-md max-w-2xl mx-auto flex flex-col h-[80vh]">
            <h2 className="text-2xl font-semibold px-6 pt-6">Chat</h2>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((m, i) => (
                    <div key={i} className="space-y-2">
                        {/* Pregunta del usuario */}
                        <div className="flex justify-end">
                            <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl max-w-sm text-sm shadow">
                                {m.q}
                            </div>
                        </div>

                        {/* Respuesta del bot */}
                        <div className="flex justify-start">
                            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl max-w-sm text-sm shadow">
                                {m.a === null ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-gray-500 text-sm">Escribiendo…</span>
                                    </div>
                                ) : (

                                    <div className="mt-1 prose prose-sm max-w-none">
                                        <ReactMarkdown>
                                            {`**🤖:** ${m.a}`}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t px-6 py-4 bg-white">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        sendQuestion()
                    }}
                    className="flex space-x-2"
                >
                    <textarea
                        rows={1}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                        placeholder="Escribe tu pregunta..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        Enviar
                    </button>
                </form>
            </div>
        </div>
    )
}
