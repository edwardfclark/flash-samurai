import express, { type Request, type Response } from 'express';
import { Group } from '../models/group';
import { Card, ICard } from '../models/card';

const router = express.Router();

router.post('/api/group', async (req: Request, res: Response) => {
  const { name, description } = req.body;

  try {
    const group = Group.build({ name, description });
    await group.save();
    return res.status(201).send(group);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/api/group/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const group = await Group.findById(id);
    return res.status(201).send(group);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.put('/api/group/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const group = await Group.findOneAndUpdate({ _id: id }, body, {
      returnOriginal: false,
    });
    return res.status(201).send(group);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.delete('/api/group/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!id) {
      throw new Error('No ID, could not delete the group!');
    }
    const group = await Group.findOneAndDelete({ _id: id });
    await Card.deleteMany({ group: id });

    return res.status(201).send(group);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get(
  '/api/group/:id/cards',
  async (
    req: Request<
      { id: string },
      { data: ICard[]; page: number; limit: number; total: number },
      unknown,
      { limit: string; page: string }
    >,
    res: Response
  ) => {
    const { id } = req.params;
    const { limit, page } = req.query;
    const parsedLimit = parseInt(limit ?? 10, 10);
    const parsedPage = parseInt(page ?? 1, 10);

    try {
      const cards = await Card.find({ group: id })
        .limit(parsedLimit * 1)
        .skip((parsedPage - 1) * parsedLimit)
        .exec();

      const total = await Card.countDocuments({ group: id });

      return res.status(201).send({ data: cards, page: parsedPage, limit: parsedLimit, total });
    } catch (err) {
      return res.status(500).send(err);
    }
  }
);

export { router as groupRouter };
