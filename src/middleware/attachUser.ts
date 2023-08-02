import jwt from 'jsonwebtoken';
import { type NextFunction, type Request, type Response } from 'express';
import { User } from '../models/user';

const { SECRET = 'secret' } = process.env;

export async function attachUser(req: Request, res: Response, next: NextFunction) {
  const { authorization = '' } = req.headers;
  const token = authorization.split(' ')[1];
  const payload = (await jwt.verify(token, SECRET)) as unknown as { username?: string };

  const username = payload?.username;

  if (!username) {
    return res.status(400).send({ error: 'Token verification failed' });
  }

  // Find the user with the payload's username
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).send({ error: 'User not found' });
  }
  req.user = user;
  next();
}
