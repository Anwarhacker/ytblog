import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

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

export async function GET() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected, fetching videos...');
    const videos = await Video.find({}).sort({ createdAt: -1 });
    console.log('Videos fetched:', videos.length);
    
    return NextResponse.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch videos', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const videoData = await request.json();
    
    const video = new Video(videoData);
    await video.save();
    
    return NextResponse.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create video' },
      { status: 500 }
    );
  }
}