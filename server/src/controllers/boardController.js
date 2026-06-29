import Board from '../models/Board.js';

export const getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId }).lean();
    if (!board) return res.json({ elements: [], versions: [], exists: false });
    res.json({ elements: board.elements, versions: board.versions,
               name: board.name, thumbnail: board.thumbnail, exists: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const saveBoard = async (req, res) => {
  try {
    const { elements, thumbnail, name } = req.body;
    const userId = req.user?._id;

    const update = {
      $set:  { elements, updatedAt: new Date(), ...(thumbnail && { thumbnail }), ...(name && { name }) },
      $push: { versions: { $each: [{ elements, savedAt: new Date(), savedBy: req.user?.username }], $slice: -10 } },
    };
    if (userId) { update.$addToSet = { members: userId }; }

    const board = await Board.findOneAndUpdate(
      { roomId: req.params.roomId },
      update,
      { upsert: true, new: true }
    );
    res.json({ success: true, boardId: board._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const clearBoard = async (req, res) => {
  try {
    await Board.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $set: { elements: [], updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getUserBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .select('roomId name thumbnail updatedAt members owner elements')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const result = boards.map(b => ({
      roomId:       b.roomId,
      name:         b.name || 'Untitled Board',
      thumbnail:    b.thumbnail || '',
      updatedAt:    b.updatedAt,
      elementCount: b.elements?.length || 0,
      memberCount:  b.members?.length  || 0,
      isOwner:      String(b.owner) === String(req.user._id),
    }));

    res.json({ boards: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createBoard = async (req, res) => {
  try {
    const { name } = req.body;
    const roomId   = Math.random().toString(36).slice(2, 10);
    const board    = await Board.create({
      roomId,
      name:    name || 'Untitled Board',
      owner:   req.user._id,
      members: [req.user._id],
    });
    res.status(201).json({ roomId: board.roomId, name: board.name });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getBoardVersions = async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId }, { versions: 1 }).lean();
    if (!board) return res.json({ versions: [] });
    const versions = board.versions.map((v, i) => ({
      index: i, savedAt: v.savedAt, savedBy: v.savedBy, elementCount: v.elements.length,
    })).reverse();
    res.json({ versions });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const restoreVersion = async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId }).lean();
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const version = board.versions[parseInt(req.params.versionIndex)];
    if (!version) return res.status(404).json({ error: 'Version not found' });
    await Board.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $set: { elements: version.elements, updatedAt: new Date() } }
    );
    res.json({ success: true, elements: version.elements });
  } catch (err) { res.status(500).json({ error: err.message }); }
};