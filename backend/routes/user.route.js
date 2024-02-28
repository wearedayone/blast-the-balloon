import { Router } from 'express';

import * as controller from '../controllers/user.controller.js';

const router = Router();

router.post('/refCode', controller.addRefCode);

router.post('/connect', controller.connectWallet);

export default router;
