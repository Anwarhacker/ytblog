import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  videoId: {
    type: String,
    required: true,
    trim: true
  },
  thumbnail: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Video || mongoose.model('Video', VideoSchema);