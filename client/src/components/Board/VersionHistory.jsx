import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useBoardStore from '../../store/boardStore';
import { socket } from '../../socket/socket';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function VersionHistory({ roomId, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const { setElements } = useBoardStore();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${SERVER_URL}/api/boards/${roomId}/versions`);
        setVersions(data.versions);
      } catch {
        toast.error('Could not load versions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [roomId]);

  const handleRestore = async (version) => {
    if (!window.confirm(`Restore version from ${formatDate(version.savedAt)}?`)) return;
    setRestoring(version.index);
    try {
      const { data } = await axios.post(
        `${SERVER_URL}/api/boards/${roomId}/restore/${version.index}`
      );
      setElements(data.elements);
      socket.emit('sync-elements', { roomId, elements: data.elements });
      toast.success('Version restored!');
      onClose();
    } catch {
      toast.error('Restore failed');
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="absolute right-0 top-12 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="text-white font-semibold text-sm">Version history</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading && (
          <div className="p-4 text-slate-400 text-sm text-center">Loading…</div>
        )}

        {!loading && versions.length === 0 && (
          <div className="p-4 text-slate-400 text-sm text-center">
            No saved versions yet. Click 💾 to save one.
          </div>
        )}

        {versions.map((v) => (
          <div
            key={v.index}
            className="flex items-center justify-between px-4 py-3 border-b border-slate-700 hover:bg-slate-750 group"
          >
            <div>
              <p className="text-white text-xs font-medium">{formatDate(v.savedAt)}</p>
              <p className="text-slate-400 text-xs">{v.elementCount} elements</p>
            </div>
            <button
              onClick={() => handleRestore(v)}
              disabled={restoring === v.index}
              className="text-xs px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition"
            >
              {restoring === v.index ? '…' : 'Restore'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-slate-500 text-xs p-3 text-center">
        Last 10 saves kept
      </p>
    </div>
  );
}