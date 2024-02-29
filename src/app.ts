import express from 'express';
import { json } from 'body-parser';
import { cardRouter } from './routes/cards';
import { groupRouter } from './routes/groups';
import { userRouter } from './routes/users';
import { tagRouter } from './routes/tags';
import { performanceRouter } from './routes/performance';
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
app.use(tagRouter);
app.use(userRouter);
app.use(performanceRouter);

export { app };
