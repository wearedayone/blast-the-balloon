import * as services from '../services/user.service.js';
import logger from '../utils/logger.js';

export const addRefCode = async (req, res) => {
  try {
    const { message, signature, inviteCode } = req.body;
    const result = await services.addUserRefCode({
      message,
      signature,
      inviteCode,
    });
    return res.status(200).send(result);
  } catch (err) {
    console.error(err);
    logger.error(err);
    return res.status(400).send(err.message);
  }
};

export const connectWallet = async (req, res) => {
  try {
    const { message, signature } = req.body;
    await services.createUserRecord({
      message,
      signature,
    });
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    logger.error(err);
    return res.status(400).send(err.message);
  }
};
