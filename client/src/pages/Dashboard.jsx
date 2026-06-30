import { useEffect, useState } from 'react';
import { useNavigate }          from 'react-router-dom';
import { Plus, LogOut, Clock, Users, Trash2, ExternalLink } from 'lucide-react';
import toast                    from 'react-hot-toast';
import api                      from '../api/axios';
import useAuthStore             from '../store/authStore';

export default function Dashboard() {
  const navigate          = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [boards,   setBoards]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName,  setNewName]  = useState('');
  const [showNew,  setShowNew]  = useState(false);
  const [joinId, setJoinId] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const { data } = await api.get('/api/boards/my');
      setBoards(data.boards);
    } catch { toast.error('Could not load boards'); }
    finally  { setLoading(false); }
  };

  const createBoard = async () => {
    if (!newName.trim()) { toast.error('Enter a board name'); return; }
    setCreating(true);
    try {
      const { data } = await api.post('/api/boards/create', { name: newName.trim() });
      toast.success('Board created!');
      navigate(`/board/${data.roomId}`);
    } catch { toast.error('Could not create board'); }
    finally  { setCreating(false); }
  };

  const logout = async () => {
    await api.post('/api/auth/logout').catch(() => {});
    clearAuth();
    navigate('/login');
  };

  const timeAgo = (d) => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60)   return 'just now';
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400)return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-sm" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            Distributed<span className="text-indigo-400">Board</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: user?.color || '#6366f1' }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-white text-sm hidden sm:block">{user?.username}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl font-bold">My Boards</h1>
            <p className="text-slate-400 text-sm mt-1">{boards.length} board{boards.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-900/30"
          >
            <Plus size={16} /> New board
          </button>
        </div>

        {/* Join by room ID */}
        <div className="flex items-center gap-2 mb-8 bg-slate-900 border border-slate-800 rounded-xl p-3">
          <input
            className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-indigo-500 transition"
            placeholder="Have a room ID? Paste it here to join"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinId.trim() && navigate(`/join/${joinId.trim()}`)}
          />
          <button
            onClick={() => joinId.trim() && navigate(`/join/${joinId.trim()}`)}
            className="px-4 py-2 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition"
          >
            Join
          </button>
        </div>

        {/* New board modal */}
        {showNew && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <h2 className="text-white font-semibold text-lg mb-4">New board</h2>
              <input
                autoFocus
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition mb-4"
                placeholder="Board name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createBoard()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowNew(false); setNewName(''); }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createBoard}
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-52 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && boards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
              <Plus size={28} className="text-slate-500" />
            </div>
            <h2 className="text-white text-lg font-semibold mb-2">No boards yet</h2>
            <p className="text-slate-400 text-sm mb-6">Create your first collaborative whiteboard</p>
            <button
              onClick={() => setShowNew(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Create board
            </button>
          </div>
        )}

        {/* Board grid */}
        {!loading && boards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map(board => (
              <BoardCard
                key={board.roomId}
                board={board}
                timeAgo={timeAgo}
                onOpen={() => navigate(`/board/${board.roomId}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BoardCard({ board, timeAgo, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-900/20 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="h-36 bg-slate-950 border-b border-slate-800 flex items-center justify-center overflow-hidden relative">
        {board.thumbnail ? (
          <img src={board.thumbnail} alt={board.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-30">
            <div className="w-12 h-8 border-2 border-slate-400 rounded" />
            <div className="flex gap-2">
              <div className="w-6 h-6 border-2 border-slate-400 rounded-full" />
              <div className="w-8 h-1 bg-slate-400 rounded mt-2.5" />
            </div>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
            <ExternalLink size={12} /> Open board
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm truncate mb-2">{board.name}</h3>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={11} /> {timeAgo(board.updatedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} /> {board.memberCount}
          </span>
          <span>{board.elementCount} elements</span>
        </div>
      </div>
    </div>
  );
}