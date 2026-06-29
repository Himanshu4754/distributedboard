import { Play, Square, Zap, Clock } from 'lucide-react';

export default function ReplayPanel({
  elements,
  isReplaying,
  replayProgress,
  onStart,
  onStop,
  onClose,
}) {
  return (
    <div className="absolute right-4 top-14 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-indigo-400" />
          <h2 className="text-white font-semibold text-sm">Session Replay</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">×</button>
      </div>

      <div className="p-4 space-y-4">
        {/* Element count */}
        <div className="bg-slate-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-indigo-400">{elements.length}</p>
          <p className="text-slate-400 text-xs mt-0.5">total strokes to replay</p>
        </div>

        {/* Progress bar */}
        {isReplaying && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Replaying…</span>
              <span>{replayProgress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-150"
                style={{ width: `${replayProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Speed buttons */}
        {!isReplaying && (
          <div>
            <p className="text-slate-400 text-xs mb-2">Replay speed</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '0.5×', speed: 0.5 },
                { label: '1×',   speed: 1   },
                { label: '2×',   speed: 2   },
              ].map(({ label, speed }) => (
                <button
                  key={speed}
                  onClick={() => onStart(elements, speed)}
                  disabled={elements.length === 0}
                  className="flex flex-col items-center gap-1 py-2 rounded-lg bg-slate-700 hover:bg-indigo-600 text-white text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stop button */}
        {isReplaying && (
          <button
            onClick={onStop}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm transition"
          >
            <Square size={14} />
            Stop Replay
          </button>
        )}

        <p className="text-slate-500 text-xs text-center">
          Replay shows board being drawn stroke by stroke
        </p>
      </div>
    </div>
  );
}