import express, { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';

const router = express.Router();

const { SECRET = 'secret' } = process.env;

router.post('/api/signup', async (req: Request, res: Response) => {
  const { username, password: rawPass } = req.body;
  try {
    // Hash the password
    const password = await bcrypt.hash(rawPass, 10);

    // Create a new user
    const user = await User.build({ username, password });

    return res.status(201).send(user);
  } catch (err) {
    return res.status(500).send(err);
  }
});

router.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    // Check if the user exists
    const user = await User.findOne({ username });

    if (!!user) {
      // Check if password matches
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        // Sign token and send it in response
        const token = jwt.sign({ username }, SECRET);
        res.status(201).send({ token });
      } else {
        res.status(400).send({ error: 'Invalid password' });
      }
    } else {
      res.status(400).send({ error: 'Invalid user' });
    }
  } catch (err) {
    return res.status(500).send(err);
  }
});
