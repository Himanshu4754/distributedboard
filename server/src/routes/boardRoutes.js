import express from 'express';
import {
  getBoard, saveBoard, clearBoard,
  getUserBoards, createBoard,
  getBoardVersions, restoreVersion,
} from '../controllers/boardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/my',                          protect, getUserBoards);
router.post('/create',                     protect, createBoard);
router.get('/:roomId',                     getBoard);
router.post('/:roomId/save',               protect, saveBoard);
router.delete('/:roomId/clear',            clearBoard);
router.get('/:roomId/versions',            getBoardVersions);
router.post('/:roomId/restore/:versionIndex', protect, restoreVersion);

export default router;