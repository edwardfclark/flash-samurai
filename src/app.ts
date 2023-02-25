import express from 'express';
import { json } from 'body-parser';
import { cardRouter } from './routes/cards';
import { groupRouter } from './routes/groups';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(json());
app.use(cardRouter);
app.use(groupRouter);

export { app };
