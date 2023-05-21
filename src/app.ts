import express from 'express';
import { json } from 'body-parser';
import { cardRouter } from './routes/cards';
import { groupRouter } from './routes/groups';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Global middleware
app.use(cors());
app.use(morgan('tiny'));
app.use(json());

// Routes
app.use(cardRouter);
app.use(groupRouter);

export { app };
