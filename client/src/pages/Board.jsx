import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import toast from 'react-hot-toast';
import axios from 'axios';

import Canvas from '../components/Board/Canvas';
import Toolbar from '../components/Board/Toolbar';
import CursorOverlay from '../components/Board/CursorOverlay';
import PresenceBadge from '../components/UI/PresenceBadge';
import useBoardStore from '../store/boardStore';
import { useSocket } from '../hooks/useSocket';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function Board() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const stageRef = useRef(null);

  const {
    setRoomId, setUsername, clearElements,
    elements, undo, setElements,
  } = useBoardStore();

  // Get username from localStorage (set on home page)
  const username = localStorage.getItem('db_username') || 'Anonymous';

  useEffect(() => {
    if (!localStorage.getItem('db_username')) {
      navigate('/');
      return;
    }
    setRoomId(roomId);
    setUsername(username);
  }, [roomId]);

  const { emitDraw, emitClear, emitCursor, emitUndo } = useSocket(roomId, username);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useHotkeys('ctrl+z, meta+z', () => handleUndo(), { preventDefault: true });

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleUndo = () => {
    undo();
    const { elements: newElements } = useBoardStore.getState();
    emitUndo(newElements);
  };

  const handleClear = async () => {
    if (!window.confirm('Clear the entire board?')) return;
    clearElements();
    emitClear();
    try {
      await axios.delete(`${SERVER_URL}/api/boards/${roomId}/clear`);
    } catch (e) { /* non-critical */ }
    toast.success('Board cleared');
  };

  const handleSave = async () => {
    try {
      await axios.post(`${SERVER_URL}/api/boards/${roomId}/save`, { elements });
      toast.success('Board saved!');
    } catch (e) {
      toast.error('Save failed');
    }
  };

  const handleExport = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `board-${roomId}.png`;
    link.href = uri;
    link.click();
    toast.success('Exported as PNG');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900">
      {/* Top bar */}
      <PresenceBadge onCopyLink={copyLink} />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar toolbar */}
        <Toolbar
          onClear={handleClear}
          onSave={handleSave}
          onUndo={handleUndo}
          onExport={handleExport}
        />

        {/* Canvas area */}
        <div className="relative flex-1">
          <Canvas
            stageRef={stageRef}
            emitDraw={emitDraw}
            emitCursor={emitCursor}
          />
          <CursorOverlay />
        </div>
      </div>
    </div>
  );
}