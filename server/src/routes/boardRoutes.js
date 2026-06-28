import express from 'express';
import {
  getBoard,
  saveBoard,
  clearBoard,
} from '../controllers/boardController.js';

const router = express.Router();

router.get('/:roomId', getBoard);
router.post('/:roomId/save', saveBoard);
router.delete('/:roomId/clear', clearBoard);

export default router;