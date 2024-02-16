import * as services from '../services/user.service.js';

export const addRefCode = async (req, res) => {
  try {
    const { message, signature, refCode } = req.body;
    const result = await services.addUserRefCode({
      message,
      signature,
      refCode,
    });
    return res.status(200).send(result);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
};
