/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  shopID: {
    type: Number,
  },
  jellyID: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  dateAdded: {
    type: Date,
    required: true,
  },
  dateUpdated: {
    type: Date,
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'dateAdded',
    updatedAt: 'dateUpdated',
  },
});

itemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const itemModel = mongoose.model('Item', itemSchema);
export default itemModel;
