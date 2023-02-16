import { app } from './app';
import mongoose from 'mongoose';

mongoose.connect(process?.env?.MONGO_URI ?? '', {}, () => {
  console.log(`Connected to database at: ${process.env.MONGO_URI}`);
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port: ${process.env.PORT}`);
});
