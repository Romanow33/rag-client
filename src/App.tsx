import PDFUploader from './components/PDFUploader'
import ChatBox from './components/Chat'
const BACKEND = import.meta.env.VITE_BACKEND_URL!

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-md py-4 px-6 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-indigo-600">📄 PDF Chat Assistant</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* PDFUploader */}
          <div className="md:w-1/2">
            <PDFUploader backend={BACKEND} />
          </div>

          {/* ChatBox */}
          <div className="md:w-1/2">
            <ChatBox backend={BACKEND} />
          </div>
        </div>
      </div>
    </div>
  )
}
