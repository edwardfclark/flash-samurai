import express, { type Request, type Response } from 'express';
import { Group } from '../models/group';

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
    const group = await Group.findOneAndDelete({ _id: id });
    return res.status(201).send(group);
  } catch (err) {
    return res.status(500).send(err);
  }
});

export { router as groupRouter };
