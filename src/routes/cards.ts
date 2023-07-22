import express, { type Request, type Response } from 'express';
import { Card } from '../models/card';
import { Group } from '../models/group';
import { isAuthenticated } from '../middleware/auth';
import { removeDuplicatesFromArray } from '../utils/removeDuplicatesFromArray';

const router = express.Router();

router.post('/api/card', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Check if group exists before building the card
    await Group.findById(req.body.groupId);

    // Prevent duplicate tags
    const tags = req.body.tags || [];
    const uniqueTags = removeDuplicatesFromArray(tags, 'name');

    const card = Card.build({ ...req.body, tags: uniqueTags });
    await card.save();
    return res.status(201).send(card);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/api/card/:id', isAuthenticated, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const card = await Card.findById(id);
    return res.status(200).send(card);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.put('/api/card/:id', isAuthenticated, async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const card = await Card.findOneAndUpdate({ _id: id }, body, {
      returnOriginal: false,
    });
    return res.status(200).send(card);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.delete('/api/card/:id', isAuthenticated, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const card = await Card.findOneAndDelete({ _id: id });
    return res.status(200).send(card);
  } catch (err) {
    return res.status(500).send(err);
  }
});

export { router as cardRouter };
