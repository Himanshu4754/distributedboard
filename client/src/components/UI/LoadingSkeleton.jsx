export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-slate-900 items-center justify-center gap-4">
      <div className="flex gap-2 items-center">
        <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="text-slate-400 text-sm">Loading board…</p>
    </div>
  );
}