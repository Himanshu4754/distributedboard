import { useEffect, useState } from 'react';
import { Check, X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { socket } from '../../socket/socket';

export default function JoinRequestsPanel({ roomId, isOwner, onClose }) {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!isOwner) return;
    loadRequests();

    socket.on('join-request-received', (data) => {
      if (data.roomId === roomId) {
        toast(`${data.requesterName} wants to join`, { icon: '🔔' });
        loadRequests();
      }
    });

    return () => socket.off('join-request-received');
  }, [roomId, isOwner]);

  const loadRequests = async () => {
    try {
      const { data } = await api.get(`/api/boards/${roomId}/requests`);
      setRequests(data.requests);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const respond = async (requestId, action, role = 'editor') => {
    try {
      await api.post(`/api/boards/${roomId}/requests/${requestId}/respond`, { action, role });
      setRequests(prev => prev.filter(r => r._id !== requestId));
      toast.success(action === 'approve' ? 'Request approved' : 'Request denied');
    } catch { toast.error('Action failed'); }
  };

  if (!isOwner) return null;

  return (
    <div className="absolute right-4 top-14 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <UserPlus size={14} className="text-indigo-400" />
          <h2 className="text-white font-semibold text-sm">Join requests</h2>
          {requests.length > 0 && (
            <span className="bg-indigo-600 text-white text-xs px-1.5 rounded-full">{requests.length}</span>
          )}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-lg leading-none">×</button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading && <div className="p-4 text-slate-400 text-sm text-center">Loading…</div>}

        {!loading && requests.length === 0 && (
          <div className="p-6 text-center">
            <UserPlus size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No pending requests</p>
          </div>
        )}

        {requests.map((r) => (
          <div key={r._id} className="px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: r.user?.color || '#6366f1' }}
              >
                {r.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-white text-xs font-medium">{r.username}</p>
                <p className="text-slate-500 text-xs">{r.user?.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => respond(r._id, 'approve', 'editor')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-700/30 hover:bg-green-700/50 text-green-400 text-xs transition"
              >
                <Check size={12} /> Editor
              </button>
              <button
                onClick={() => respond(r._id, 'approve', 'viewer')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-700/30 hover:bg-blue-700/50 text-blue-400 text-xs transition"
              >
                <Check size={12} /> Viewer
              </button>
              <button
                onClick={() => respond(r._id, 'deny')}
                className="px-2.5 flex items-center justify-center rounded-lg bg-red-700/30 hover:bg-red-700/50 text-red-400 transition"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}