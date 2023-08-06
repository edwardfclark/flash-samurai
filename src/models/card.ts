import mongoose from 'mongoose';

interface ICard {
  question: string;
  answer: string;
  groupId: mongoose.ObjectId;
  reference?: string;
  tags?: {
    name: string;
    description?: string;
  }[];
}

interface CardDoc extends mongoose.Document {
  question: string;
  answer: string;
  groupId: mongoose.ObjectId;
  reference?: string;
  tags?: {
    name: string;
    description: string;
  }[];
}

interface cardModelInterface extends mongoose.Model<CardDoc> {
  build(card: ICard): CardDoc;
}

const cardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  groupId: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    required: false,
  },
  tags: [{ name: String, description: String }],
});

cardSchema.statics.build = (card: ICard) => {
  return new Card(card);
};

const Card = mongoose.model<CardDoc, cardModelInterface>('Card', cardSchema);

export { Card, ICard };
