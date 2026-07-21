export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-950 text-white overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 translate-y-1/2 w-100 h-100 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="relative z-10 max-w-2xl px-6 py-12 text-center flex flex-col items-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-md text-xs font-medium text-zinc-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
          Internal Portal
        </div>

        {/* Brand/Title */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 bg-linear-to-r from-white via-zinc-200 to-zinc-450 bg-clip-text text-transparent">
          LYDINC{' '}
          <span className="bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            TaskHub
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-zinc-400 max-w-lg leading-relaxed font-medium mb-12">
          Internal Project and Task Management System
        </p>

        {/* Quick action card */}
        <div className="w-full max-w-md p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl hover:border-zinc-700/50 transition-all duration-300 shadow-2xl">
          <div className="flex flex-col gap-3">
            <button className="w-full py-3 px-4 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-150 transition-colors shadow-lg shadow-white/5 cursor-pointer">
              Access Workspace
            </button>
            <div className="h-px bg-zinc-800/60 my-2" />
            <p className="text-xs text-zinc-500">
              Authorized personnel only. Activities are logged.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
