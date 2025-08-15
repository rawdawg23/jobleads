export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold text-white mb-4">Test Page</h1>
        <p className="text-slate-300 mb-6">
          This is a simple test page to verify your ECU remapping platform is working.
        </p>
        <div className="space-y-2 text-sm text-slate-400">
          <p>✅ Next.js is running</p>
          <p>✅ Styling is working</p>
          <p>✅ Page routing is functional</p>
        </div>
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-yellow-500 text-slate-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  )
}
