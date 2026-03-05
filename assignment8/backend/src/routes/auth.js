import express from 'express';
import {login} from '../auth.js';

const router = new express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const {email, password} = req.body;
    const result = await login(email, password);
    if (!result) {
      res.status(401).json({message: 'Invalid credentials'});
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;

