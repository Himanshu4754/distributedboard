import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Lock, Send, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { socket } from '../socket/socket';
import useAuthStore from '../store/authStore';

export default function RequestAccess() {
  const { roomId } = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuthStore();
  const navigatingRef = useRef(false);

  const [status, setStatus]       = useState('checking');
  const [boardName, setBoardName] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    checkAccess();

    if (!socket.connected) socket.connect();

    const subscribe = () => {
      socket.emit('subscribe-notifications', { userId: user.id });
      console.log('[RequestAccess] Subscribed to notifications for', user.id);
    };

    if (socket.connected) subscribe();
    socket.on('connect', subscribe);

    const handleResponse = (data) => {
      console.log('[RequestAccess] Received join-request-responded:', data);
      if (data.roomId !== roomId) return;

      if (data.approved) {
        toast.success(`Access granted as ${data.role}!`);
        navigatingRef.current = true;

        // Fully tear down this socket session BEFORE navigating,
        // so Board.jsx's useSocket starts from a clean, disconnected state
        socket.off('connect', subscribe);
        socket.off('join-request-responded', handleResponse);
        socket.disconnect();

        setTimeout(() => navigate(`/board/${roomId}`), 300);
      } else {
        setStatus('denied');
        toast.error('Your request was denied');
      }
    };

    socket.on('join-request-responded', handleResponse);

    return () => {
      // Only clean up here if we did NOT already do it in handleResponse
      if (!navigatingRef.current) {
        socket.off('connect', subscribe);
        socket.off('join-request-responded', handleResponse);
        socket.disconnect();
      }
    };
  }, [roomId, user]);

  const checkAccess = async () => {
    try {
      const { data } = await api.get(`/api/boards/${roomId}/my-access`);
      if (data.hasAccess) {
        navigate(`/board/${roomId}`);
        return;
      }
      if (data.pending) {
        setStatus('pending');
      } else {
        setBoardName(data.boardName || 'this board');
        setStatus('needs-request');
      }
    } catch {
      setStatus('error');
    }
  };

  const sendRequest = async () => {
    try {
      const { data } = await api.post(`/api/boards/${roomId}/request-join`);
      if (data.approved) {
        toast.success('Joined!');
        socket.disconnect();
        navigate(`/board/${roomId}`);
      } else if (data.pending) {
        setStatus('pending');
        toast.success('Request sent to the board owner');
      } else if (data.alreadyMember) {
        socket.disconnect();
        navigate(`/board/${roomId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not send request');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        {status === 'checking' && (
          <>
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Clock className="text-slate-400 animate-pulse" size={20} />
            </div>
            <p className="text-slate-400 text-sm">Checking access…</p>
          </>
        )}

        {status === 'needs-request' && (
          <>
            <div className="w-12 h-12 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center mx-auto mb-4">
              <Lock className="text-indigo-400" size={20} />
            </div>
            <h1 className="text-white font-semibold text-lg mb-1">Request access</h1>
            <p className="text-slate-400 text-sm mb-6">
              <span className="text-white font-medium">{boardName}</span> requires owner approval to join
            </p>
            <button
              onClick={sendRequest}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition"
            >
              <Send size={15} /> Send join request
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full mt-2 py-2.5 text-slate-400 hover:text-white text-sm transition"
            >
              Go back
            </button>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-12 h-12 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center mx-auto mb-4">
              <Clock className="text-amber-400" size={20} />
            </div>
            <h1 className="text-white font-semibold text-lg mb-1">Waiting for approval</h1>
            <p className="text-slate-400 text-sm mb-6">
              Your request has been sent. You'll be redirected automatically once the owner responds.
            </p>
            <div className="flex justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </>
        )}

        {status === 'denied' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-red-400" size={20} />
            </div>
            <h1 className="text-white font-semibold text-lg mb-1">Request denied</h1>
            <p className="text-slate-400 text-sm mb-6">The board owner did not approve your request.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition"
            >
              Back to dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800 flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-red-400" size={20} />
            </div>
            <h1 className="text-white font-semibold text-lg mb-1">Board not found</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition"
            >
              Back to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}