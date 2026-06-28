import { v4 as uuidv4 } from 'uuid';
import Board from '../models/Board.js';
import { joinRoom, leaveRoom, getUsers, updateCursor } from './roomManager.js';

export const initSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ─── JOIN ROOM ──────────────────────────────────────────────────────────
    socket.on('join-room', async ({ roomId, username }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;
      socket.userId = uuidv4();

      const users = joinRoom(roomId, {
        id: socket.userId,
        socketId: socket.id,
        username,
        color: generateColor(socket.id),
      });

      // Tell the room someone joined
      socket.to(roomId).emit('user-joined', {
        userId: socket.userId,
        username,
        users,
      });

      // Send this socket the full current board from DB
      try {
        const board = await Board.findOne({ roomId });
        socket.emit('board-state', {
          elements: board ? board.elements : [],
          users,
        });
      } catch (err) {
        socket.emit('board-state', { elements: [], users });
      }

      // Send updated user list to everyone in room
      io.to(roomId).emit('users-updated', users);

      console.log(`${username} joined room ${roomId}`);
    });

    // ─── DRAW ELEMENT ────────────────────────────────────────────────────────
    // Broadcast a completed element to everyone else in the room
    socket.on('draw-element', ({ roomId, element }) => {
      socket.to(roomId).emit('draw-element', element);
    });

    // ─── DRAWING IN PROGRESS ────────────────────────────────────────────────
    // For pencil strokes being drawn live (high frequency)
    socket.on('drawing', ({ roomId, element }) => {
      socket.to(roomId).emit('drawing', element);
    });

    // ─── CURSOR MOVE ─────────────────────────────────────────────────────────
    socket.on('cursor-move', ({ roomId, x, y }) => {
      updateCursor(roomId, socket.userId, { x, y });
      socket.to(roomId).emit('cursor-move', {
        userId: socket.userId,
        username: socket.username,
        color: generateColor(socket.id),
        x,
        y,
      });
    });

    // ─── CLEAR BOARD ─────────────────────────────────────────────────────────
    socket.on('clear-board', ({ roomId }) => {
      socket.to(roomId).emit('clear-board');
    });

    // ─── UNDO ────────────────────────────────────────────────────────────────
    socket.on('undo', ({ roomId, elements }) => {
      socket.to(roomId).emit('sync-elements', elements);
    });

    // ─── DISCONNECT ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const { roomId, userId, username } = socket;
      if (!roomId) return;

      const users = leaveRoom(roomId, userId);
      io.to(roomId).emit('user-left', { userId, username, users });
      io.to(roomId).emit('users-updated', users);

      console.log(`${username} left room ${roomId}`);
    });
  });
};

// Deterministic color from socket id
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