import mongoose from 'mongoose';

interface ICard {
  question: string;
  answer: string;
  group: string;
}

interface CardDoc extends mongoose.Document {
  question: string;
  answer: string;
  group: string;
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
  group: {
    type: String,
    required: true,
  },
});

cardSchema.statics.build = (card: ICard) => {
  return new Card(card);
};

const Card = mongoose.model<CardDoc, cardModelInterface>('Card', cardSchema);

export { Card, ICard };
