import { useEffect, useCallback, useRef } from 'react';
import { socket } from '../socket/socket';
import useBoardStore from '../store/boardStore';
import toast from 'react-hot-toast';

export const useSocket = (roomId, username) => {
  const {
    addElement,
    setElements,
    clearElements,
    setUsers,
    updateCursor,
    removeCursor,
  } = useBoardStore();

  // Throttle cursor events — emit max once per 40ms (~25fps)
  const cursorThrottle = useRef(null);

  useEffect(() => {
    if (!roomId || !username) return;

    socket.connect();

    socket.on("connect", () => {
        console.log("Connected:", socket.id);
        socket.emit("join-room", { roomId, username });
    });

    // Full board state on join
    socket.on('board-state', ({ elements, users }) => {
      setElements(elements);
      setUsers(users);
    });

    // Peer completed a stroke/shape
    socket.on('draw-element', (element) => {
      addElement(element);
    });

    // Peer cleared the board
    socket.on('clear-board', () => {
      clearElements();
    });

    // Peer undid — sync their resulting state
    socket.on('sync-elements', (elements) => {
      setElements(elements);
    });

    // Live cursor from a peer
    socket.on('cursor-move', ({ userId, username, color, x, y }) => {
      updateCursor(userId, { username, color, x, y });
    });

    // Save acknowledgements
    socket.on('save-success', () => {
      toast.success('Board saved & version snapshot created!');
    });

    socket.on('save-error', (msg) => {
      toast.error(`Save failed: ${msg}`);
    });

    // Presence
    socket.on('user-joined', ({ username: name, users }) => {
      toast(`${name} joined`, { icon: '👋', duration: 2000 });
      setUsers(users);
    });

    socket.on('user-left', ({ username: name, users }) => {
      toast(`${name} left`, { duration: 2000 });
      setUsers(users);
    });

    socket.on('users-updated', (users) => setUsers(users));

    // Connection events
    socket.on('connect_error', () => {
      toast.error('Connection lost. Retrying…', { id: 'conn-err' });
    });

    socket.on('connect', () => {
      toast.dismiss('conn-err');
    });

    return () => {
      [
        'board-state', 'draw-element', 'clear-board',
        'sync-elements', 'cursor-move', 'save-success',
        'save-error', 'user-joined', 'user-left',
        'users-updated', 'connect_error', 'connect',
      ].forEach((ev) => socket.off(ev));
      socket.disconnect();
    };
  }, [roomId, username]);

  // ── Emit helpers ──────────────────────────────────────────────────────

  const emitDraw = useCallback((element) => {
    socket.emit('draw-element', { roomId, element });
  }, [roomId]);

  const emitClear = useCallback(() => {
    socket.emit('clear-board', { roomId });
  }, [roomId]);

  // Throttled cursor — batches rapid mouse-move events
  const emitCursor = useCallback((x, y) => {
    if (cursorThrottle.current) return;
    cursorThrottle.current = setTimeout(() => {
      socket.emit('cursor-move', { roomId, x, y });
      cursorThrottle.current = null;
    }, 40);
  }, [roomId]);

  const emitUndo = useCallback((elements) => {
    socket.emit('undo', { roomId, elements });
  }, [roomId]);

  const emitSave = useCallback((elements) => {
    socket.emit('save-board', { roomId, elements });
  }, [roomId]);

  return { emitDraw, emitClear, emitCursor, emitUndo, emitSave };
};