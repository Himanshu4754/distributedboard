import Board from '../models/Board.js';

export const getBoard = async (req, res) => {
  try {
    const board = await Board.findOne({ roomId: req.params.roomId });
    if (!board) return res.json({ elements: [] });
    res.json({ elements: board.elements, versions: board.versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveBoard = async (req, res) => {
  try {
    const { elements } = req.body;
    const board = await Board.findOneAndUpdate(
      { roomId: req.params.roomId },
      {
        $set: { elements },
        $push: {
          versions: {
            $each: [{ elements, savedAt: new Date() }],
            $slice: -10,
          },
        },
      },
      { upsert: true, new: true }
    );
    res.json({ success: true, boardId: board._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const clearBoard = async (req, res) => {
  try {
    await Board.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $set: { elements: [] } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};