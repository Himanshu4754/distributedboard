import Board from '../models/Board.js';
import { getIO } from '../socket/ioInstance.js';

// POST /api/boards/:roomId/request-join
export const requestJoin = async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const existingRole = board.getRole(req.user._id);
    if (existingRole) {
      return res.json({ alreadyMember: true, role: existingRole });
    }

    // Public boards: instant join as editor
    if (board.isPublic) {
      board.members.push({ user: req.user._id, role: 'editor' });
      await board.save();
      return res.json({ approved: true, role: 'editor' });
    }

    // Already has a pending request?
    const existingReq = board.joinRequests.find(
      r => String(r.user) === String(req.user._id) && r.status === 'pending'
    );
    if (existingReq) return res.json({ pending: true });

    board.joinRequests.push({
      user: req.user._id,
      username: req.user.username,
      status: 'pending',
    });
    await board.save();

    // Notify the owner in real time
    const io = getIO();
    io.to(`owner:${board.owner}`).emit('join-request-received', {
      roomId:   board.roomId,
      boardName: board.name,
      requesterId: req.user._id,
      requesterName: req.user.username,
    });

    res.json({ pending: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/boards/:roomId/requests  (owner only)
export const getJoinRequests = async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId })
      .populate('joinRequests.user', 'username email color');
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (String(board.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Only the owner can view requests' });
    }

    const pending = board.joinRequests.filter(r => r.status === 'pending');
    res.json({ requests: pending });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/boards/:roomId/requests/:requestId/respond
export const respondToRequest = async (req, res) => {
  try {
    const { action, role } = req.body; // action: 'approve' | 'deny', role: 'editor' | 'viewer'
    const board = await Board.findOne({ roomId: req.params.roomId });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    if (String(board.owner) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Only the owner can respond to requests' });
    }

    const request = board.joinRequests.id(req.params.requestId);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = action === 'approve' ? 'approved' : 'denied';

    if (action === 'approve') {
      board.members.push({ user: request.user, role: role || 'editor' });
    }
    await board.save();

    // Notify the requester in real time
    const io = getIO();
    io.to(`user:${request.user}`).emit('join-request-responded', {
      roomId:   board.roomId,
      boardName: board.name,
      approved: action === 'approve',
      role:     role || 'editor',
    });

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/boards/:roomId/my-access  — check current user's status
export const getMyAccess = async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    const role = board.getRole(req.user._id);
    if (role) return res.json({ hasAccess: true, role });

    const pendingReq = board.joinRequests.find(
      r => String(r.user) === String(req.user._id) && r.status === 'pending'
    );
    if (pendingReq) return res.json({ hasAccess: false, pending: true });

    res.json({ hasAccess: false, pending: false, isPublic: board.isPublic, boardName: board.name });
  } catch (err) { res.status(500).json({ error: err.message }); }
};