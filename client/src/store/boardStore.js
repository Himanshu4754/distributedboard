import { create } from 'zustand';

const useBoardStore = create((set, get) => ({
  // Board data
  elements: [],
  currentElement: null,

  // Tool state
  tool: 'pencil',
  color: '#ffffff',
  strokeWidth: 3,

  // Undo history (stack of element snapshots)
  history: [],

  // Collaboration
  users: [],
  cursors: {},
  roomId: null,
  username: null,

  // UI state
  isSaving: false,
  isLoading: true,

  // ── Tool actions ─────────────────────────────────────────────────────────
  setTool:        (tool)        => set({ tool }),
  setColor:       (color)       => set({ color }),
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),

  // ── Room actions ─────────────────────────────────────────────────────────
  setRoomId:   (roomId)   => set({ roomId }),
  setUsername: (username) => set({ username }),
  setUsers:    (users)    => set({ users }),
  setLoading:  (v)        => set({ isLoading: v }),
  setSaving:   (v)        => set({ isSaving: v }),

  // ── Element actions ───────────────────────────────────────────────────────

  // Add a completed element (saves undo snapshot first)
  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      history: [...state.history.slice(-49), [...state.elements]], // keep 50 history items
    })),

  // Update the last element in place (used while drawing in progress)
  updateLastElement: (element) =>
    set((state) => ({
      elements: [...state.elements.slice(0, -1), element],
    })),

  // Replace entire element list (on join / sync / restore)
  setElements: (elements) =>
    set({ elements, history: [], isLoading: false }),

  clearElements: () =>
    set((state) => ({
      elements: [],
      history: [...state.history.slice(-49), [...state.elements]],
    })),

  // Pop last history snapshot
  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        elements: prev,
        history: state.history.slice(0, -1),
      };
    }),

  // ── Cursor tracking ───────────────────────────────────────────────────────
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