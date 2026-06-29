import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Plus, ArrowRight, Users, Zap, Shield } from 'lucide-react';

const FEATURES = [
  { Icon: Zap,    title: 'Real-time sync',     desc: 'Every stroke synced in <50ms across all users'   },
  { Icon: Users,  title: 'Live collaboration', desc: 'See cursors, presence, and changes instantly'     },
  { Icon: Shield, title: 'Persistent boards',  desc: 'Auto-saved to MongoDB, reload anytime'           },
];

export default function Home() {
  const navigate = useNavigate();
  const [roomId,   setRoomId]   = useState('');
  const [username, setUsername] = useState('');
  const [tab,      setTab]      = useState('create'); // 'create' | 'join'

  const go = (rid) => {
    if (!username.trim()) { alert('Enter your name first'); return; }
    localStorage.setItem('db_username', username.trim());
    navigate(`/board/${rid}`);
  };

  const handleCreate = () => go(uuidv4().slice(0, 8));
  const handleJoin   = () => {
    if (!roomId.trim()) { alert('Enter a room code'); return; }
    go(roomId.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-sm" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            Distributed<span className="text-indigo-400">Board</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Free · Open · Real-time
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs mb-8">
          <Zap size={11} className="text-indigo-400" />
          Real-time collaborative whiteboard
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
          Draw together,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            think together
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-md mb-10">
          A multiplayer whiteboard with live cursors, session replay, and version history — built for teams.
        </p>

        {/* Card */}
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          {/* Name input */}
          <div className="mb-5">
            <label className="block text-slate-400 text-xs mb-1.5">Your name</label>
            <input
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-slate-800 p-0.5 mb-4">
            {['create', 'join'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition capitalize
                  ${tab === t
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {t === 'create' ? '+ Create board' : '→ Join board'}
              </button>
            ))}
          </div>

          {tab === 'create' ? (
            <button
              onClick={handleCreate}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-900/40"
            >
              <Plus size={16} />
              Create new board
            </button>
          ) : (
            <div className="space-y-2.5">
              <input
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition font-mono"
                placeholder="Room code (e.g. 5ae64d50)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <button
                onClick={handleJoin}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition"
              >
                <ArrowRight size={16} />
                Join board
              </button>
            </div>
          )}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-900 flex items-center justify-center flex-shrink-0">
                <Icon size={13} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">{title}</p>
                <p className="text-slate-500 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}