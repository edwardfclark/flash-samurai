import express from 'express';
import { json } from 'body-parser';
import { cardRouter } from './routes/cards';

const app = express();
app.use(json());
app.use(cardRouter);

export { app };
