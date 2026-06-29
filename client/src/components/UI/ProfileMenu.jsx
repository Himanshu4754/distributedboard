import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useBoardStore from '../../store/boardStore';

const AVATAR_COLORS = [
  '#6366f1','#f87171','#34d399','#fbbf24','#38bdf8','#e879f9',
];

const getAvatarColor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { username, users, roomId } = useBoardStore();

  const color = getAvatarColor(username);

  const handleLeave = () => {
    if (window.confirm('Leave this board?')) {
      navigate('/');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-700 transition"
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-600"
          style={{ backgroundColor: color }}
        >
          {username?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-white text-xs font-medium leading-none">{username}</p>
          <p className="text-slate-400 text-xs leading-none mt-0.5">{users.length} in room</p>
        </div>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-10 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Profile header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{username}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <p className="text-slate-400 text-xs">Active</p>
                </div>
              </div>
            </div>

            {/* Room info */}
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-slate-400 text-xs mb-1">Current room</p>
              <code className="text-indigo-400 text-xs font-mono">{roomId}</code>
            </div>

            {/* Users in room */}
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-slate-400 text-xs mb-2">Members ({users.length})</p>
              <div className="space-y-1.5">
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-white text-xs">{u.username}</span>
                    {u.username === username && (
                      <span className="text-indigo-400 text-xs ml-auto">you</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leave */}
            <button
              onClick={handleLeave}
              className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-slate-700 text-sm transition"
            >
              <LogOut size={14} />
              Leave board
            </button>
          </div>
        </>
      )}
    </div>
  );
}