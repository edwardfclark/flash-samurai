import { app } from './app';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/flash-samurai', {}, () => {
  console.log('connected to database');
});

app.listen(3000, () => {
  console.log('server is listening on port 3000');
});
