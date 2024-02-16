import { Router } from 'express';

import { addRefCode } from '../controllers/user.controller.js';

const router = Router();

router.post('/refCode', addRefCode);

export default router;
