import mongoose from 'mongoose';

interface IUser {
  username: string;
  password: string;
}

interface UserDoc extends mongoose.Document {
  username: string;
  password: string;
}

interface userModelInterface extends mongoose.Model<UserDoc> {
  build(user: IUser): UserDoc;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
});

userSchema.statics.build = (user: IUser) => {
  return new User(user);
};

const User = mongoose.model<UserDoc, userModelInterface>('User', userSchema);

export { User, IUser };
