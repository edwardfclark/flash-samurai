import jwt from 'jsonwebtoken';
import { type NextFunction, type Request, type Response } from 'express';

const { SECRET = 'secret' } = process.env;

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  try {
    if (authorization) {
      const token = authorization.split(' ')[1];
      if (token) {
        const payload = await jwt.verify(token, SECRET);
        if (payload) {
          next();
        } else {
          return res.status(400).send({ error: 'Token verification failed' });
        }
      } else {
        return res.status(400).send({ error: 'Token not found' });
      }
    } else {
      return res.status(400).send({ error: 'Authorization header not found' });
    }
  } catch (err) {
    return res.status(500).send(err);
  }
}
