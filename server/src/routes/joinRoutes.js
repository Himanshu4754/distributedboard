import express from 'express';
import {
  requestJoin, getJoinRequests, respondToRequest, getMyAccess,
} from '../controllers/joinController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:roomId/my-access',                    protect, getMyAccess);
router.post('/:roomId/request-join',                 protect, requestJoin);
router.get('/:roomId/requests',                       protect, getJoinRequests);
router.post('/:roomId/requests/:requestId/respond',   protect, respondToRequest);

export default router;