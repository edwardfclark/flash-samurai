import express, { type Request, type Response } from 'express';
import { Card } from '../models/card';

const router = express.Router();

router.get('/api/card', (req: Request, res: Response) => {
  return res.send('the card');
});

router.post('/api/card', async (req: Request, res: Response) => {
  const { question, answer, group } = req.body;

  const card = Card.build({ question, answer, group });
  await card.save();
  return res.status(201).send(card);
});

export { router as cardRouter };
