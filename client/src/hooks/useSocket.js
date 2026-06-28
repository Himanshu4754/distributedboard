import { useEffect, useCallback } from 'react';
import { socket } from '../socket/socket';
import useBoardStore from '../store/boardStore';
import toast from 'react-hot-toast';

export const useSocket = (roomId, username) => {
  const {
    addElement, setElements, clearElements,
    setUsers, updateCursor, removeCursor,
    elements, undo,
  } = useBoardStore();

  useEffect(() => {
    if (!roomId || !username) return;

    socket.connect();
    socket.emit('join-room', { roomId, username });

    // Receive full board on join
    socket.on('board-state', ({ elements, users }) => {
      setElements(elements);
      setUsers(users);
    });

    // Someone else drew a complete element
    socket.on('draw-element', (element) => {
      addElement(element);
    });

    // Another user cleared the board
    socket.on('clear-board', () => {
      clearElements();
    });

    // Sync after undo from another user
    socket.on('sync-elements', (elements) => {
      setElements(elements);
    });

    // Cursor updates
    socket.on('cursor-move', ({ userId, username, color, x, y }) => {
      updateCursor(userId, { username, color, x, y });
    });

    // Presence events
    socket.on('user-joined', ({ username, users }) => {
      toast(`${username} joined`, { icon: '👋', duration: 2000 });
      setUsers(users);
    });

    socket.on('user-left', ({ username, users }) => {
      toast(`${username} left`, { icon: '👋', duration: 2000 });
      setUsers(users);
      removeCursor(username);
    });

    socket.on('users-updated', (users) => setUsers(users));

    socket.on('connect_error', () => {
      toast.error('Connection lost. Reconnecting…');
    });

    return () => {
      socket.off('board-state');
      socket.off('draw-element');
      socket.off('clear-board');
      socket.off('sync-elements');
      socket.off('cursor-move');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('users-updated');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [roomId, username]);

  const emitDraw = useCallback((element) => {
    socket.emit('draw-element', { roomId, element });
  }, [roomId]);

  const emitClear = useCallback(() => {
    socket.emit('clear-board', { roomId });
  }, [roomId]);

  const emitCursor = useCallback((x, y) => {
    socket.emit('cursor-move', { roomId, x, y });
  }, [roomId]);

  const emitUndo = useCallback((elements) => {
    socket.emit('undo', { roomId, elements });
  }, [roomId]);

  return { emitDraw, emitClear, emitCursor, emitUndo };
};