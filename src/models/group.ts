import mongoose from 'mongoose';

interface IGroup {
  name: string;
  description?: string;
}

interface GroupDoc extends mongoose.Document {
  name: string;
  description: string;
}

interface groupModelInterface extends mongoose.Model<GroupDoc> {
  build(group: IGroup): GroupDoc;
}

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

groupSchema.statics.build = (group: IGroup) => {
  return new Group(group);
};

const Group = mongoose.model<GroupDoc, groupModelInterface>('Group', groupSchema);

export { Group, IGroup };
