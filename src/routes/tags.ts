import express, { type Request, type Response } from 'express';
import { Tag } from '../models/tag';
import { Group } from '../models/group';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.post('/api/tag', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // Check if group exists before building the tag
    await Group.findById(req.body.groupId);

    // Check if tag with the same name exists
    const existingTag = await Tag.findOne({ name: req.body.name });
    console.log('THIS FIRED');
    if (existingTag) {
      throw new Error('A tag with the same name already exists.');
    }

    const tag = Tag.build(req.body);
    await tag.save();
    return res.status(201).send(tag);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.get('/api/tag/:id', isAuthenticated, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findById(id);
    return res.status(200).send(tag);
  } catch (err) {
    return res.status(500).send(err);
  }
});

export { router as tagRouter };
