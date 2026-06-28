import { v4 as uuidv4 } from 'uuid';
import Board from '../models/Board.js';
import { joinRoom, leaveRoom, getUsers, updateCursor } from './roomManager.js';

// Debounce map: roomId → timeout handle
const autoSaveTimers = new Map();

const AUTO_SAVE_DELAY = 3000; // ms

// ── Helpers ───────────────────────────────────────────────────────────────

const COLORS = [
  '#f87171', '#fb923c', '#fbbf24', '#34d399',
  '#38bdf8', '#818cf8', '#e879f9', '#f472b6',
];

const generateColor = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

// Debounced auto-save: resets timer every time an element arrives
const scheduleAutoSave = (roomId, elements) => {
  if (autoSaveTimers.has(roomId)) {
    clearTimeout(autoSaveTimers.get(roomId));
  }
  const timer = setTimeout(async () => {
    try {
      await Board.findOneAndUpdate(
        { roomId },
        { $set: { elements, updatedAt: new Date() } },
        { upsert: true }
      );
      console.log(`Auto-saved board ${roomId} (${elements.length} elements)`);
    } catch (err) {
      console.error(`Auto-save failed for ${roomId}:`, err.message);
    } finally {
      autoSaveTimers.delete(roomId);
    }
  }, AUTO_SAVE_DELAY);
  autoSaveTimers.set(roomId, timer);
};

// ── Main handler ──────────────────────────────────────────────────────────

export const initSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ── JOIN ROOM ──────────────────────────────────────────────────────────
    socket.on('join-room', async ({ roomId, username }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;
      socket.userId = uuidv4();
      socket.color = generateColor(socket.id);

      const users = joinRoom(roomId, {
        id: socket.userId,
        socketId: socket.id,
        username,
        color: socket.color,
      });

      // Notify others
      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        username,
        users,
      });

      // Send this socket the full board + user list
      try {
        const board = await Board.findOne({ roomId }).lean();
        socket.emit('board-state', {
          elements: board?.elements ?? [],
          users,
        });
      } catch (err) {
        console.error('Failed to load board on join:', err.message);
        socket.emit('board-state', { elements: [], users });
      }

      io.to(roomId).emit('users-updated', users);
      console.log(`${username} joined room ${roomId} (${users.length} users)`);
    });

    // ── DRAW ELEMENT (completed stroke/shape) ─────────────────────────────
    socket.on('draw-element', async ({ roomId, element }) => {
      // 1. Broadcast to peers immediately
      socket.to(roomId).emit('draw-element', element);

      // 2. Push element into DB array atomically
      try {
        await Board.findOneAndUpdate(
          { roomId },
          {
            $push: { elements: element },
            $set: { updatedAt: new Date() },
          },
          { upsert: true }
        );
      } catch (err) {
        console.error(`Failed to persist element in ${roomId}:`, err.message);
      }
    });

    // ── LIVE DRAWING (in-progress pencil strokes) ─────────────────────────
    // High-frequency — broadcast only, never persist
    socket.on('drawing', ({ roomId, element }) => {
      socket.to(roomId).emit('drawing', element);
    });

    // ── CURSOR MOVE ───────────────────────────────────────────────────────
    // Throttled on client side; just relay here
    socket.on('cursor-move', ({ roomId, x, y }) => {
      updateCursor(roomId, socket.userId, { x, y });
      socket.to(roomId).emit('cursor-move', {
        userId: socket.userId,
        username: socket.username,
        color: socket.color,
        x,
        y,
      });
    });

    // ── CLEAR BOARD ───────────────────────────────────────────────────────
    socket.on('clear-board', async ({ roomId }) => {
      socket.to(roomId).emit('clear-board');
      try {
        await Board.findOneAndUpdate(
          { roomId },
          { $set: { elements: [], updatedAt: new Date() } },
          { upsert: true }
        );
      } catch (err) {
        console.error(`Failed to clear board ${roomId}:`, err.message);
      }
    });

    // ── UNDO (sync full element state after undo) ─────────────────────────
    socket.on('undo', async ({ roomId, elements }) => {
      // Broadcast new state to peers
      socket.to(roomId).emit('sync-elements', elements);

      // Debounced save (undo can fire rapidly)
      scheduleAutoSave(roomId, elements);
    });

    // ── EXPLICIT SAVE (with version snapshot) ─────────────────────────────
    socket.on('save-board', async ({ roomId, elements }) => {
      try {
        await Board.findOneAndUpdate(
          { roomId },
          {
            $set: { elements, updatedAt: new Date() },
            $push: {
              versions: {
                $each: [{ elements, savedAt: new Date() }],
                $slice: -10,  // keep last 10 versions
              },
            },
          },
          { upsert: true }
        );
        socket.emit('save-success');
      } catch (err) {
        console.error(`Explicit save failed for ${roomId}:`, err.message);
        socket.emit('save-error', err.message);
      }
    });

    // ── DISCONNECT ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const { roomId, userId, username } = socket;
      if (!roomId) return;

      const users = leaveRoom(roomId, userId);
      io.to(roomId).emit('user-left', { userId, username, users });
      io.to(roomId).emit('users-updated', users);

      console.log(`${username} left room ${roomId} (${users.length} remaining)`);
    });
  });
};