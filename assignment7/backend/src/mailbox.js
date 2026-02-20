import * as db from './db';

/**
 * GET /api/v0/mailbox
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {import('express').NextFunction} next The next middleware function
 */
export const getMailboxes = async (req, res, next) => {
  try {
    const mailboxes = await db.selectMailboxes();
    res.status(200).json(mailboxes);
  } catch (err) {
    next(err);
  }
};
