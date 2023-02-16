import express from 'express';
import { json } from 'body-parser';
import { cardRouter } from './routes/cards';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(json());
app.use(cardRouter);

export { app };
