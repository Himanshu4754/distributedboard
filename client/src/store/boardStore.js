import { create } from 'zustand';

const useBoardStore = create((set, get) => ({
  // Drawing state
  elements: [],
  currentElement: null,
  tool: 'pencil',
  color: '#ffffff',
  strokeWidth: 3,

  // Collaboration state
  users: [],
  cursors: {},
  roomId: null,
  username: null,

  // History for undo
  history: [],

  // Actions
  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setStrokeWidth: (w) => set({ strokeWidth: w }),
  setUsers: (users) => set({ users }),
  setRoomId: (roomId) => set({ roomId }),
  setUsername: (username) => set({ username }),

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      history: [...state.history, state.elements],
    })),

  updateLastElement: (element) =>
    set((state) => ({
      elements: [...state.elements.slice(0, -1), element],
    })),

  setElements: (elements) => set({ elements, history: [] }),

  clearElements: () =>
    set((state) => ({
      elements: [],
      history: [...state.history, state.elements],
    })),

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        elements: prev,
        history: state.history.slice(0, -1),
      };
    }),

  updateCursor: (userId, data) =>
    set((state) => ({
      cursors: { ...state.cursors, [userId]: data },
    })),

  removeCursor: (userId) =>
    set((state) => {
      const cursors = { ...state.cursors };
      delete cursors[userId];
      return { cursors };
    }),
}));

export default useBoardStore;