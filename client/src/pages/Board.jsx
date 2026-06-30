import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate }  from 'react-router-dom';
import { useHotkeys }              from 'react-hotkeys-hook';
import toast                       from 'react-hot-toast';
import api                         from '../api/axios';

import Canvas          from '../components/Board/Canvas';
import Toolbar         from '../components/Board/Toolbar';
import CursorOverlay   from '../components/Board/CursorOverlay';
import PresenceBadge   from '../components/UI/PresenceBadge';
import VersionHistory  from '../components/Board/VersionHistory';
import ReplayPanel     from '../components/Board/ReplayPanel';
import ShortcutsPanel  from '../components/UI/ShortcutsPanel';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';

import useBoardStore   from '../store/boardStore';
import useAuthStore    from '../store/authStore';
import { useSocket }   from '../hooks/useSocket';
import { useReplay }   from '../hooks/useReplay';

export default function Board() {
  const { roomId }  = useParams();
  const navigate    = useNavigate();
  const stageRef    = useRef(null);

  const [showVersions,  setShowVersions]  = useState(false);
  const [showReplay,    setShowReplay]    = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [role, setRole]                   = useState(null); // 'owner' | 'editor' | 'viewer'

  const { user } = useAuthStore();
  const {
    setRoomId, setUsername, clearElements,
    elements, undo, isLoading, isSaving, setSaving, setTool,
  } = useBoardStore();

  // Access check — runs before anything else
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    (async () => {
      try {
        const { data } = await api.get(`/api/boards/${roomId}/my-access`);
        if (!data.hasAccess) {
          navigate(`/join/${roomId}`);
          return;
        }
        setRole(data.role);
        setAccessChecked(true);
      } catch {
        navigate('/dashboard');
      }
    })();
  }, [roomId, user]);

  useEffect(() => {
    if (!accessChecked) return;
    setRoomId(roomId);
    setUsername(user.username);
  }, [roomId, user, accessChecked]);

  const { emitDraw, emitClear, emitCursor, emitUndo, emitSave } =
    useSocket(accessChecked ? roomId : null, user?.username);

  const { isReplaying, replayProgress, startReplay, stopReplay } = useReplay();

  const canEdit = role === 'owner' || role === 'editor';

  useHotkeys('ctrl+z, meta+z', () => canEdit && handleUndo(), { preventDefault: true });
  useHotkeys('ctrl+s, meta+s', () => canEdit && handleSave(), { preventDefault: true });
  useHotkeys('p', () => canEdit && setTool('pencil'), { preventDefault: true });
  useHotkeys('r', () => canEdit && setTool('rect'),   { preventDefault: true });
  useHotkeys('c', () => canEdit && setTool('circle'), { preventDefault: true });
  useHotkeys('e', () => canEdit && setTool('eraser'), { preventDefault: true });
  useHotkeys('t', () => canEdit && setTool('text'),   { preventDefault: true });
  useHotkeys('escape', () => {
    setShowVersions(false); setShowReplay(false); setShowShortcuts(false);
  });

  function handleUndo() {
    undo();
    emitUndo(useBoardStore.getState().elements);
  }

  async function handleSave() {
    setSaving(true);
    try {
      let thumbnail = '';
      if (stageRef.current) {
        thumbnail = stageRef.current.toDataURL({ pixelRatio: 0.3, mimeType: 'image/jpeg', quality: 0.5 });
      }
      const currentElements = useBoardStore.getState().elements;
      await api.post(`/api/boards/${roomId}/save`, { elements: currentElements, thumbnail });
      emitSave(currentElements);
      toast.success('Board saved!');
    } catch { toast.error('Save failed'); }
    finally  { setSaving(false); }
  }

  const handleClear = useCallback(() => {
    if (!canEdit) { toast.error('You have view-only access'); return; }
    if (!window.confirm('Clear the entire board for everyone?')) return;
    clearElements();
    emitClear();
    toast.success('Board cleared');
  }, [clearElements, emitClear, canEdit]);

  const handleExport = useCallback(() => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ mimeType: 'image/png', quality: 1, pixelRatio: 2 });
    const link    = document.createElement('a');
    link.download = `DistributedBoard-${roomId}.png`;
    link.href     = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported as PNG!');
  }, [roomId]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${roomId}`);
    toast.success('Invite link copied!');
  }, [roomId]);

  const togglePanel = (panel) => {
    setShowVersions(  panel === 'versions'  ? v => !v : false);
    setShowReplay(    panel === 'replay'    ? v => !v : false);
    setShowShortcuts( panel === 'shortcuts' ? v => !v : false);
  };

  if (!accessChecked || isLoading) return <LoadingSkeleton />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 select-none">
      <PresenceBadge onCopyLink={handleCopyLink} isOwner={role === 'owner'} roomId={roomId} />

      {role === 'viewer' && (
        <div className="bg-amber-900/30 border-b border-amber-800/50 px-4 py-1.5 text-center">
          <span className="text-amber-400 text-xs">👁 View-only access — you cannot edit this board</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <Toolbar
          onClear={handleClear}    onSave={handleSave}
          onUndo={handleUndo}      onExport={handleExport}
          onVersions={() => togglePanel('versions')}
          onReplay={()   => togglePanel('replay')}
          onShortcuts={() => togglePanel('shortcuts')}
          isSaving={isSaving}
          canEdit={canEdit}
        />

        <div className="relative flex-1 overflow-hidden">
          <Canvas stageRef={stageRef} emitDraw={canEdit ? emitDraw : () => {}} emitCursor={emitCursor} canEdit={canEdit} />
          <CursorOverlay />

          {showVersions  && <VersionHistory roomId={roomId} onClose={() => setShowVersions(false)} />}
          {showReplay    && (
            <ReplayPanel elements={elements} isReplaying={isReplaying} replayProgress={replayProgress}
              onStart={startReplay} onStop={stopReplay} onClose={() => setShowReplay(false)} />
          )}
          {showShortcuts && <ShortcutsPanel onClose={() => setShowShortcuts(false)} />}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-1 bg-slate-900 border-t border-slate-800 text-xs text-slate-600 flex-shrink-0">
        <span>{elements.length} elements</span>
        <span>Role: {role}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-green-600">Connected</span>
        </div>
      </div>
    </div>
  );
}