import { v4 as uuidv4 } from 'uuid';
import Board from '../models/Board.js';
import { joinRoom, leaveRoom, getUsers, updateCursor } from './roomManager.js';

const COLORS = ['#f87171','#fb923c','#fbbf24','#34d399','#38bdf8','#818cf8','#e879f9','#f472b6'];
const generateColor = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
};

// In-memory element log per room for conflict resolution
// Structure: roomId → Map<elementId, element>
const roomElements = new Map();

const getRoomElements = (roomId) => {
  if (!roomElements.has(roomId)) roomElements.set(roomId, new Map());
  return roomElements.get(roomId);
};

// Last-write-wins: newer timestamp always wins
const mergeElement = (roomId, incoming) => {
  const store   = getRoomElements(roomId);
  const existing = store.get(incoming.id);

  // Accept if: new element OR incoming is newer (timestamp-based LWW)
  if (!existing || (incoming.timestamp || 0) >= (existing.timestamp || 0)) {
    store.set(incoming.id, { ...incoming, timestamp: incoming.timestamp || Date.now() });
    return true;
  }
  return false; // reject stale update
};

const pendingSaves = new Map();

const scheduleAutoSave = (roomId) => {
  if (pendingSaves.has(roomId)) clearTimeout(pendingSaves.get(roomId));
  const timer = setTimeout(async () => {
    try {
      const elements = Array.from(getRoomElements(roomId).values());
      await Board.findOneAndUpdate(
        { roomId },
        { $set: { elements, updatedAt: new Date() } },
        { upsert: true }
      );
      console.log(`[Auto-save] ${roomId} → ${elements.length} elements`);
    } catch (err) {
      console.error(`[Auto-save] FAILED ${roomId}:`, err.message);
    } finally {
      pendingSaves.delete(roomId);
    }
  }, 3000);
  pendingSaves.set(roomId, timer);
};

export const initSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ── Subscribe to personal notification channel ──────────────────────────
    // Used by RequestAccess page to wait for approval, and owners to get
    // join-request alerts, without going through the heavy board join-room logic
    socket.on('subscribe-notifications', ({ userId }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      console.log(`[Notify] Socket ${socket.id} subscribed to user:${userId}`);
    });

    socket.on('join-room', async ({ roomId, username, userId }) => {
      socket.join(roomId);
      socket.roomId   = roomId;
      socket.username = username;
      socket.userId   = uuidv4();
      socket.color    = generateColor(socket.id);

      const users = joinRoom(roomId, {
        id: socket.userId, socketId: socket.id, username, color: socket.color,
      });

      socket.to(roomId).emit('user-joined', { userId: socket.userId, username, users });

      try {
        const board = await Board.findOne({ roomId }).lean();
        const elements = board?.elements ?? [];
        if (getRoomElements(roomId).size === 0 && elements.length > 0) {
          elements.forEach(el => getRoomElements(roomId).set(el.id, el));
        }
        console.log(`[Join] ${username} → room ${roomId} | ${elements.length} elements`);
        socket.emit('board-state', { elements, users });

        // Also subscribe owner to their "owner inbox" for join request notifications
        if (board?.owner) socket.join(`owner:${board.owner}`);
      } catch (err) {
        console.error(`[Join] Load failed for ${roomId}:`, err.message);
        socket.emit('board-state', { elements: [], users });
      }

      io.to(roomId).emit('users-updated', users);
    });

    // draw-element: LWW merge then broadcast
    socket.on('draw-element', async ({ roomId, element }) => {
      const enriched = { ...element, userId: socket.userId, timestamp: Date.now() };
      const accepted = mergeElement(roomId, enriched);

      if (accepted) {
        socket.to(roomId).emit('draw-element', enriched);
        scheduleAutoSave(roomId);
      } else {
        // Tell the sender their element was rejected (stale)
        socket.emit('element-rejected', { id: element.id });
      }
    });

    socket.on('drawing', ({ roomId, element }) => {
      socket.to(roomId).emit('drawing', element);
    });

    socket.on('cursor-move', ({ roomId, x, y }) => {
      updateCursor(roomId, socket.userId, { x, y });
      socket.to(roomId).emit('cursor-move', {
        userId: socket.userId, username: socket.username, color: socket.color, x, y,
      });
    });

    socket.on('clear-board', async ({ roomId }) => {
      getRoomElements(roomId).clear();
      socket.to(roomId).emit('clear-board');
      try {
        await Board.findOneAndUpdate(
          { roomId }, { $set: { elements: [], updatedAt: new Date() } }, { upsert: true }
        );
        console.log(`[Clear] Room ${roomId}`);
      } catch (err) { console.error(`[Clear] Failed:`, err.message); }
    });

    socket.on('undo', ({ roomId, elements }) => {
      // Rebuild in-memory store from undo state
      getRoomElements(roomId).clear();
      elements.forEach(el => getRoomElements(roomId).set(el.id, el));
      socket.to(roomId).emit('sync-elements', elements);
      scheduleAutoSave(roomId);
    });

    socket.on('save-board', async ({ roomId, elements }) => {
      try {
        await Board.findOneAndUpdate(
          { roomId },
          {
            $set:  { elements, updatedAt: new Date() },
            $push: { versions: { $each: [{ elements, savedAt: new Date(), savedBy: socket.username }], $slice: -10 } },
          },
          { upsert: true, new: true }
        );
        console.log(`[Save] Room ${roomId} explicit save (${elements.length} elements)`);
        socket.emit('save-success');
      } catch (err) {
        console.error(`[Save] Failed:`, err.message);
        socket.emit('save-error', err.message);
      }
    });

    socket.on('disconnect', () => {
      const { roomId, userId, username } = socket;
      if (!roomId) return;
      const users = leaveRoom(roomId, userId);
      io.to(roomId).emit('user-left',     { userId, username, users });
      io.to(roomId).emit('users-updated', users);
      console.log(`[Socket] ${username} left ${roomId} (${users.length} remaining)`);
    });
  });
};