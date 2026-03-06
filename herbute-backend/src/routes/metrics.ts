import express from 'express';
import { register } from '../middleware/metrics.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

export default router;
