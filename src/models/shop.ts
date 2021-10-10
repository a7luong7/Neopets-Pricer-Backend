/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  neoID: {
    type: Number,
    required: true,
  },
  jellyID: {
    type: Number,
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
});

shopSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const shopModel = mongoose.model('Shop', shopSchema);
export default shopModel;
