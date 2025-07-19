import mongoose from "mongoose";
const tweetSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

export const tweet = mongoose.model('tweet', tweetSchema);