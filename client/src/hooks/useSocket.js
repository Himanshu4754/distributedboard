import { useEffect, useCallback, useRef } from 'react';
import { socket } from '../socket/socket';
import useBoardStore from '../store/boardStore';
import toast from 'react-hot-toast';

export const useSocket = (roomId, username) => {
  const {
    addElement, setElements, clearElements,
    setUsers, updateCursor, removeCursor, setLoading,
  } = useBoardStore();

  const cursorThrottle = useRef(null);

  useEffect(() => {
    if (!roomId || !username) return;

    // Always force a clean slate: disconnect first if somehow already
    // connected from a previous page (e.g. RequestAccess), then reconnect
    // fresh so listener registration order is guaranteed correct.
    if (socket.connected) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    // ── Register ALL listeners BEFORE connecting ──────────────────────────
    socket.on('board-state', ({ elements, users }) => {
      console.log('[useSocket] board-state received:', elements.length, 'elements,', users.length, 'users');
      setElements(elements);
      setUsers(users);
    });

    socket.on('draw-element', (element) => addElement(element));
    socket.on('clear-board', () => clearElements());
    socket.on('sync-elements', (elements) => setElements(elements));
    socket.on('cursor-move', ({ userId, username, color, x, y }) =>
      updateCursor(userId, { username, color, x, y })
    );

    socket.on('save-success', () => toast.success('Board saved & version snapshot created!'));
    socket.on('save-error', (msg) => toast.error(`Save failed: ${msg}`));

    socket.on('user-joined', ({ username: name, users }) => {
      toast(`${name} joined`, { icon: '👋', duration: 2000 });
      setUsers(users);
    });
    socket.on('user-left', ({ username: name, users }) => {
      toast(`${name} left`, { duration: 2000 });
      setUsers(users);
    });
    socket.on('users-updated', (users) => setUsers(users));

    socket.on('connect_error', (err) => {
      console.error('[useSocket] Connection error:', err.message);
      toast.error('Cannot connect to server.', { id: 'conn-err', duration: 5000 });
      setLoading(false);
    });

    socket.on('connect', () => {
      console.log('[useSocket] Connected, joining room:', roomId);
      toast.dismiss('conn-err');
      socket.emit('join-room', { roomId, username });
    });

    socket.on('disconnect', (reason) => {
      console.warn('[useSocket] Disconnected:', reason);
    });

    // ── Now connect (always fresh after the forced disconnect above) ──────
    socket.connect();

    // Safety net — never spin forever
    const loadingTimeout = setTimeout(() => {
      const state = useBoardStore.getState();
      if (state.isLoading) {
        console.warn('[useSocket] board-state timeout — forcing isLoading: false');
        setLoading(false);
        toast.error('Server took too long to respond.', { duration: 5000 });
      }
    }, 8000);

    return () => {
      clearTimeout(loadingTimeout);
      if (cursorThrottle.current) clearTimeout(cursorThrottle.current);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [roomId, username]);

  const emitDraw = useCallback((element) => socket.emit('draw-element', { roomId, element }), [roomId]);
  const emitClear = useCallback(() => socket.emit('clear-board', { roomId }), [roomId]);
  const emitCursor = useCallback((x, y) => {
    if (cursorThrottle.current) return;
    cursorThrottle.current = setTimeout(() => {
      socket.emit('cursor-move', { roomId, x, y });
      cursorThrottle.current = null;
    }, 40);
  }, [roomId]);
  const emitUndo = useCallback((elements) => socket.emit('undo', { roomId, elements }), [roomId]);
  const emitSave = useCallback((elements) => socket.emit('save-board', { roomId, elements }), [roomId]);

  return { emitDraw, emitClear, emitCursor, emitUndo, emitSave };
};