import * as db from './db.js';

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

/**
 * GET /api/v0/mail
 * @param {object} req The request object
 * @param {object} res The response object
 * @param {import('express').NextFunction} next The next middleware
 * @returns {void}
 */
export const getMail = async (req, res, next) => {
  try {
    const mailbox = req.query.mailbox;
    // OpenAPI handles the undefined check, so we go straight to the DB!
    const mail = await db.selectMail(mailbox);
    res.status(200).json(mail);
  } catch (err) {
    next(err);
  }
};

export const moveMail = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {mailbox} = req.query;

    // Rule: Throw a 403 if the destination is 'sent'
    if (mailbox.toLowerCase() === 'sent') {
      return res.status(403).send('Cannot move mail to the sent folder');
    }

    const rowCount = await db.moveMail(id, mailbox);

    if (rowCount === 0) {
      return res.status(404).send('Email not found');
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getMailById = async (req, res, next) => {
  try {
    const {id} = req.params;
    const mail = await db.selectMailById(id);
    if (!mail) {
      return res.status(404).send('Email not found');
    }
    res.status(200).json(mail);
  } catch (err) {
    next(err);
  }
};
