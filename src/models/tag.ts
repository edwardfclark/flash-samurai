import mongoose from 'mongoose';

interface ITag {
  name: string;
  description?: string;
  groupId: mongoose.ObjectId;
}

interface TagDoc extends mongoose.Document {
  name: string;
  description?: string;
  groupId: mongoose.ObjectId;
}

interface tagModelinterface extends mongoose.Model<TagDoc> {
  build(tag: ITag): TagDoc;
}

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  groupId: {
    type: String,
    required: true,
  },
});

tagSchema.statics.build = (tag: ITag) => {
  return new Tag(tag);
};

const Tag = mongoose.model<TagDoc, tagModelinterface>('Tag', tagSchema);

export { Tag, ITag };
