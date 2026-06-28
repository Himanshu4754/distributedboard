import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import toast from 'react-hot-toast';

import Canvas from '../components/Board/Canvas';
import Toolbar from '../components/Board/Toolbar';
import CursorOverlay from '../components/Board/CursorOverlay';
import PresenceBadge from '../components/UI/PresenceBadge';
import VersionHistory from '../components/Board/VersionHistory';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import useBoardStore from '../store/boardStore';
import { useSocket } from '../hooks/useSocket';

export default function Board() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const [showVersions, setShowVersions] = useState(false);

  const {
    setRoomId,
    setUsername,
    clearElements,
    elements,
    undo,
    isLoading,
    isSaving,
    setSaving,
  } = useBoardStore();

  const username = localStorage.getItem('db_username') || 'Anonymous';

  useEffect(() => {
    if (!localStorage.getItem('db_username')) {
      navigate('/');
      return;
    }
    setRoomId(roomId);
    setUsername(username);
  }, [roomId]);

  const { emitDraw, emitClear, emitCursor, emitUndo, emitSave } =
    useSocket(roomId, username);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useHotkeys('ctrl+z, meta+z', handleUndo, { preventDefault: true });
  useHotkeys('ctrl+s, meta+s', handleSave, { preventDefault: true });

  // ── Actions ───────────────────────────────────────────────────────────────
  function handleUndo() {
    undo();
    const newElements = useBoardStore.getState().elements;
    emitUndo(newElements);
  }

  function handleSave() {
    const currentElements = useBoardStore.getState().elements;
    setSaving(true);
    emitSave(currentElements);
    // save-success / save-error toasts are handled in useSocket
    setTimeout(() => setSaving(false), 1500);
  }

  const handleClear = useCallback(() => {
    if (!window.confirm('Clear the entire board for everyone?')) return;
    clearElements();
    emitClear();
    toast.success('Board cleared');
  }, [clearElements, emitClear]);

  const handleExport = useCallback(() => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({
      mimeType: 'image/png',
      quality: 1,
      pixelRatio: 2,
    });
    const link = document.createElement('a');
    link.download = `DistributedBoard-${roomId}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported as PNG!');
  }, [roomId]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  }, []);

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 select-none">
      {/* Top presence bar */}
      <PresenceBadge onCopyLink={handleCopyLink} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left toolbar */}
        <Toolbar
          onClear={handleClear}
          onSave={handleSave}
          onUndo={handleUndo}
          onExport={handleExport}
          onVersions={() => setShowVersions((v) => !v)}
          isSaving={isSaving}
        />

        {/* Canvas */}
        <div className="relative flex-1 overflow-hidden">
          <Canvas
            stageRef={stageRef}
            emitDraw={emitDraw}
            emitCursor={emitCursor}
          />
          <CursorOverlay />

          {/* Version history panel (floating) */}
          {showVersions && (
            <VersionHistory
              roomId={roomId}
              onClose={() => setShowVersions(false)}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-800 border-t border-slate-700 text-xs text-slate-500">
        <span>{elements.length} elements</span>
        <span>Ctrl+Z undo · Ctrl+S save · Drag to draw</span>
        <span className="text-green-500">● Live</span>
      </div>
    </div>
  );
}