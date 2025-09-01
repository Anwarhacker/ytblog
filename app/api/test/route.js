import { NextResponse } from 'next/server';
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
    console.log('Testing database connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    await dbConnect();
    console.log('Database connected successfully');
    
    const count = await Video.countDocuments();
    console.log('Video count:', count);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      videoCount: count,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}