import express from 'express';
import {
  getBoard,
  saveBoard,
  clearBoard,
  getBoardVersions,
  restoreVersion,
} from '../controllers/boardController.js';

const router = express.Router();

router.get('/:roomId',                           getBoard);
router.post('/:roomId/save',                     saveBoard);
router.delete('/:roomId/clear',                  clearBoard);
router.get('/:roomId/versions',                  getBoardVersions);
router.post('/:roomId/restore/:versionIndex',    restoreVersion);

export default router;