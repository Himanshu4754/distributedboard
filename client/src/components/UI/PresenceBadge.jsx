import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import useBoardStore from '../../store/boardStore';
import ProfileMenu from '../UI/ProfileMenu';

export default function PresenceBadge({ onCopyLink }) {
  const { users, roomId } = useBoardStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 px-4 h-12 bg-slate-900 border-b border-slate-800 flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-white rounded-sm" />
        </div>
        <span className="text-white font-bold text-sm tracking-tight hidden sm:block">
          Distributed<span className="text-indigo-400">Board</span>
        </span>
      </div>

      <div className="w-px h-5 bg-slate-700" />

      {/* Room badge */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs">Room</span>
        <code className="text-indigo-300 text-xs font-mono bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md select-all">
          {roomId}
        </code>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition
            ${copied
              ? 'bg-green-900/40 border-green-700 text-green-400'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500 hover:text-indigo-400'
            }`}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-900/20 border border-green-900/40">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-400 text-xs font-medium">Live</span>
      </div>

      {/* Avatar stack */}
      <div className="flex items-center -space-x-2">
        {users.slice(0, 5).map((u, i) => (
          <div
            key={u.id}
            title={u.username}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-900"
            style={{ backgroundColor: u.color, zIndex: 10 - i }}
          >
            {u.username?.[0]?.toUpperCase()}
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 ring-2 ring-slate-900" style={{ zIndex: 4 }}>
            +{users.length - 5}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-slate-700" />

      {/* Profile menu */}
      <ProfileMenu />
    </div>
  );
}