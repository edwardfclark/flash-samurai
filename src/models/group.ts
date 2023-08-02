import mongoose from 'mongoose';

interface IGroup {
  name: string;
  description?: string;
  owner: string;
}

interface GroupDoc extends mongoose.Document {
  name: string;
  description: string;
  owner: string;
}

interface groupModelInterface extends mongoose.Model<GroupDoc> {
  build(group: IGroup): GroupDoc;
}

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
  owner: {
    type: String,
    required: true,
  },
});

groupSchema.statics.build = (group: IGroup) => {
  return new Group(group);
};

const Group = mongoose.model<GroupDoc, groupModelInterface>('Group', groupSchema);

export { Group, IGroup };
