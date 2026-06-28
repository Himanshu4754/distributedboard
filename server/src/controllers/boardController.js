import Board from '../models/Board.js';

// GET /api/boards/:roomId
export const getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId }).lean();
    if (!board) {
      return res.json({ elements: [], versions: [], exists: false });
    }
    res.json({
      elements: board.elements,
      versions: board.versions,
      updatedAt: board.updatedAt,
      exists: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/boards/:roomId/save  (explicit save with version snapshot)
export const saveBoard = async (req, res) => {
  try {
    const { elements } = req.body;
    if (!Array.isArray(elements)) {
      return res.status(400).json({ error: 'elements must be an array' });
    }

    const board = await Board.findOneAndUpdate(
      { roomId: req.params.roomId },
      {
        $set: { elements, updatedAt: new Date() },
        $push: {
          versions: {
            $each: [{ elements, savedAt: new Date() }],
            $slice: -10,
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, boardId: board._id, versionCount: board.versions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/boards/:roomId/clear
export const clearBoard = async (req, res) => {
  try {
    await Board.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $set: { elements: [], updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/boards/:roomId/versions  (version history list)
export const getBoardVersions = async (req, res) => {
  try {
    const board = await Board.findOne(
      { roomId: req.params.roomId },
      { versions: 1 }
    ).lean();

    if (!board) return res.json({ versions: [] });

    // Return versions newest-first, strip element data for the list
    const versions = board.versions
      .map((v, i) => ({
        index: i,
        savedAt: v.savedAt,
        elementCount: v.elements.length,
      }))
      .reverse();

    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/boards/:roomId/restore/:versionIndex
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};