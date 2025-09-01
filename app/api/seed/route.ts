import { NextResponse } from 'next/server';
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://anwar:malekaanwar8088331188@cluster0.urmugpa.mongodb.net/youtube-videos?retryWrites=true&w=majority&appName=Cluster0';

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  videoId: { type: String, required: true },
  thumbnail: { type: String, required: true }
}, { timestamps: true });

const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

async function dbConnect() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

export async function POST() {
  try {
    await dbConnect();
    
    const testVideo = {
      title: "Test Video",
      description: "This is a test video",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoId: "dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    };
    
    const video = new Video(testVideo);
    await video.save();
    
    return NextResponse.json({
      success: true,
      message: 'Test video added',
      data: video
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}