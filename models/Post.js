const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  likes: {
    type: Array,
    default: [],
  },
  numLikes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Array,
    default: [],
  },
  numComments: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('post', PostSchema);
