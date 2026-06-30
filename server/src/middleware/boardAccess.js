import Board from '../models/Board.js';

// Loads the board and attaches the user's role; blocks if no access
export const requireBoardAccess = (minRole = 'viewer') => {
  const ROLE_RANK = { viewer: 1, editor: 2, owner: 3 };

  return async (req, res, next) => {
    try {
      const board = await Board.findOne({ roomId: req.params.roomId });
      if (!board) return res.status(404).json({ error: 'Board not found' });

      const role = board.getRole(req.user._id);

      if (!role) {
        return res.status(403).json({
          error: 'You do not have access to this board',
          requiresRequest: true,
        });
      }

      if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
        return res.status(403).json({ error: `Requires ${minRole} role, you have ${role}` });
      }

      req.board = board;
      req.role  = role;
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};