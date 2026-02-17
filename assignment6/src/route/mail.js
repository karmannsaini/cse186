import express from 'express';
import * as mail from '../model/mail.js';

const router = new express.Router();

router.get('/', async (req, res) => {
  if (req.query.from) {
    const results = await mail.getBySender(req.query.from);
    if (!results) {
      return res.status(404).send();
    }
    return res.status(200).json(results);
  }
  const results = await mail.getMailboxes(req.query.mailbox);
  if (!results) {
    return res.status(404).send();
  }
  return res.status(200).json(results);
});

router.get('/:id', async (req, res) => {
  const result = await mail.getById(req.params.id);
  if (!result) {
    return res.status(404).send();
  }
  res.status(200).json(result);
});

router.post('/', async (req, res) => {
  const result = await mail.create(req.body);
  res.status(201).json(result);
});

router.put('/:id', async (req, res) => {
  const status = await mail.move(req.params.id, req.query.mailbox);
  res.status(status).send();
});

export default router;
