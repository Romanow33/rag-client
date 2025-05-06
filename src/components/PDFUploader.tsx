import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

interface Props {
    backend: string
}

export default function PdfUpload({ backend }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const eventSourceRef = useRef<EventSource | null>(null)
    const [clientId] = useState(() => crypto.randomUUID())

    useEffect(() => {
        return () => {
            eventSourceRef.current?.close()
        }
    }, [])

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        setStatus('⏳ Subiendo...')
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_id', clientId)

        try {
            await axios.post(`${backend}/upload_pdf`, formData)
            setStatus('✅ PDF enviado, procesando…')

            const evtSource = new EventSource(`${backend}/notifications/${clientId}`)
            eventSourceRef.current = evtSource

            evtSource.onmessage = (e) => {
                if (e.data === 'completed') {
                    setStatus('🎉 ¡Vectores listos en Qdrant!')
                    evtSource.close()
                    setLoading(false)
                    setTimeout(() => {
                        setStatus('')
                    }, 2000);
                }
            }

            evtSource.onerror = (err) => {
                console.error('SSE error', err)
                setStatus('⚠️ Error durante el procesamiento')
                setLoading(false)
                evtSource.close()
                setTimeout(() => {
                    setStatus('')
                }, 2000);
            }
        } catch {
            setStatus('❌ Error al subir el PDF')
            setLoading(false)
        } finally {
            setFile(null)
        }
    }

    const cancelUpload = () => {
        setFile(null)
        setStatus('')
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Subir un archivo PDF</h2>
            {!file && !loading && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors"
                >
                    📎 Seleccionar PDF
                </button>
            )}

            <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
            />

            {file && (
                <div className="mt-4 space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg border border-gray-300">
                        <span className="text-xl">📄</span>
                        <span className="text-gray-700 font-medium truncate">{file.name}</span>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={handleUpload}
                            className="bg-green-600 text-white px-5 py-2 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            📤 Enviar PDF
                        </button>
                        <button
                            onClick={cancelUpload}
                            className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition-colors"
                            disabled={loading}
                        >
                            ❌ Cancelar
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className="mt-6 flex items-center space-x-3 text-blue-600">
                    <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-medium">Procesando...</p>
                </div>
            )}

            {status && !loading && (
                <p className="mt-6 text-gray-700 font-medium">{status}</p>
            )}
        </div>
    )
}
